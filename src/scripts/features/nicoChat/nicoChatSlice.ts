import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AppState, nicoChatSelector, storageSelector } from "../../app/store";
import {
  nicoUsersAnonymityKey,
  nicoUsersRealKey,
} from "../../srorage/nicoUsersType";
import { Chat } from "../../types/commentWs/Chat";
import { parseKotehan } from "../../util/funcs";
import { logger } from "../../util/logging";
import { getNicoUserIconUrl, getNicoUserName } from "../../util/nico";
import { updateNicoUser } from "../storageSlice";
import { ChatMeta, NicoChat, NicoUser } from "./nicoChatTypes";

export const receiveNicoChat = createAsyncThunk(
  "nicoChat/receiveChat",
  async (chats: Chat[], { dispatch }) => {
    dispatch(nicoChatSlice.actions.addChats(chats));
    await dispatch(batchUsers());
  }
);

const batchUsers = createAsyncThunk(
  "nicoChat/batchUsers",
  async (_, thunkApi) => {
    const dispatch = thunkApi.dispatch;
    const state = thunkApi.getState() as AppState;
    for (const [userId, _] of Object.entries(
      nicoChatSelector(state).transactionUserIds
    )) {
      const transactionId = nanoid();
      dispatch(startFetchUserTransaction([userId, transactionId]));
      await dispatch(fetchUser([userId, transactionId]));
    }
  }
);

/** ユーザーを更新する */
const fetchUser = createAsyncThunk(
  "nicoChat/fetchUser",
  async ([userId, _]: [string, string], thunkApi) => {
    const dispatch = thunkApi.dispatch;
    const state = thunkApi.getState() as AppState;
    const user = nicoChatSelector(state).user.entities[userId];
    const nicoUsers = storageSelector(state).nicoUsers;
    let kotehan = user.anonymous
      ? nicoUsers[nicoUsersAnonymityKey][user.userId]?.kotehan
      : nicoUsers[nicoUsersRealKey][user.userId]?.kotehan;
    if (!user.anonymous) {
      if (kotehan == null) kotehan = await getNicoUserName(userId);
      const iconUrl = await getNicoUserIconUrl(Number(userId));
      dispatch(updateIconUrl([user.userId, iconUrl]));
    }
    dispatch(updateKotehan([user.userId, kotehan]));
    dispatch(updateNicoUser(user));

    return userId;
  },
  {
    condition: async ([userId, transactionId], { getState }) => {
      const state = getState() as AppState;
      if (transactionId != nicoChatSelector(state).transactionUserIds[userId])
        return false;
    },
  }
);

const chatsAdapter = createEntityAdapter<ChatMeta>({
  selectId: (model) => model.nanoId,
  sortComparer: (a, b) => a.date - b.date,
});

const usersAdapter = createEntityAdapter<NicoUser>({
  selectId: (model) => model.userId,
});

const initialState: NicoChat = {
  chat: chatsAdapter.getInitialState(),
  user: usersAdapter.getInitialState(),
  transactionUserIds: {},
};

const nicoChatSlice = createSlice({
  name: "nicoChat",
  initialState: initialState,
  reducers: {
    addChats: (state, action: PayloadAction<Chat[]>) => {
      action.payload.forEach((chat) => {
        const chatMeta = ChatToMeta(chat);
        const [user, isNew] = updateUser(state, chatMeta);
        chatsAdapter.addOne(state.chat, chatMeta);
        usersAdapter.setOne(state.user, user);
        if (isNew && !user.anonymous)
          state.transactionUserIds[user.userId] = undefined;
      });
    },
    startFetchUserTransaction: (
      state,
      action: PayloadAction<[string, string]>
    ) => {
      const [userId, transactionId] = action.payload;
      state.transactionUserIds[userId] ??= transactionId;
    },
    chatMetaClear: (state, action: PayloadAction) => {
      chatsAdapter.removeAll(state.chat);
    },
    updateIconUrl: (state, action: PayloadAction<[string, string]>) => {
      const [userId, iconUrl] = action.payload;
      state.user.entities[userId].iconUrl = iconUrl;
    },
    updateKotehan: (state, action: PayloadAction<[string, string]>) => {
      const [userId, kotehan] = action.payload;
      state.user.entities[userId].kotehan = kotehan;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      delete state.transactionUserIds[action.payload];
      return state;
    });
  },
});

export const nicoChatReducer = nicoChatSlice.reducer;

export const {
  chatMetaClear,
  updateKotehan,
  startFetchUserTransaction,
  updateIconUrl,
} = nicoChatSlice.actions;

/**
 * 状態とチャット情報から更新・作成したユーザー情報を返す
 * @param state
 * @param chatMeta
 * @returns [ユーザー情報, 新規ユーザーか]
 */
function updateUser(state: NicoChat, chatMeta: ChatMeta): [NicoUser, boolean] {
  let kotehan: string;
  if (chatMeta.senderType !== "Operator")
    kotehan = parseKotehan(chatMeta.comment);
  let user = state.user.entities[chatMeta.userId];
  const isNew = user == null;
  if (isNew) {
    user = {
      userId: chatMeta.userId,
      type: chatMeta.senderType,
      anonymous: chatMeta.anonymous,
      iconUrl: undefined,
      kotehan: kotehan === "" ? undefined : kotehan,
    };
  }
  return [user, isNew];
}

function ChatToMeta(chat: Chat): ChatMeta {
  let chatMeta: ChatMeta = {
    nanoId: nanoid(),
    no: chat.no,
    date: chat.date,
    mail: chat.mail,
    userId: chat.user_id,
    isPremium: chat.premium === 1,
    anonymous: chat.anonymity === 1,
    senderType:
      chat.premium === 3
        ? chat.anonymity === 1
          ? "Operator"
          : "Liver"
        : "Listner",
    comment: chat.content,
    yourpost: chat.yourpost === 1,
  };
  chatMeta.comment = commentParse(chatMeta);

  return chatMeta;
}

/**
 * 一部のコメントはコマンドやHTMLなので表示する文字を返す
 * @param chatMeta
 * @returns
 */
function commentParse(chatMeta: ChatMeta): string {
  if (chatMeta.senderType === "Operator") {
    return operatorCommentParse(chatMeta);
  } else if (chatMeta.senderType === "Liver") {
    return liverCommentParse(chatMeta);
  } else {
    return chatMeta.comment;
  }
}

/*
 * emotion    /emotion {text}
 * info       /info {num} {text}
 * > 3        /info 3 {num}分延長しました
 * > 8        /info 8 第{num}位にランクインしました
 * > 10       /info 10 「{text}」が好きな{num}人が来場しました
 * spi        /spi "「{text}」がリクエストされました"
 * nicoad     /nicoad {
 *              "totalAdPoint":{num},
 *              "message":"{【広告貢献{num}位】}{text}さんが{num}ptニコニ広告しました",
 *              "version":"{num}"}
 * disconnect /disconnect
 */
function operatorCommentParse(chat: ChatMeta) {
  const command = chat.comment.substring(1, chat.comment.indexOf(" "));
  switch (command) {
    case "emotion":
      return chat.comment.substring(9);
    case "spi":
      return chat.comment.slice(6, -1);
    case "nicoad":
      const text = JSON.parse(chat.comment.substring(8));
      return text.message;
    case "info":
      return chat.comment; // そのまま表示（NCV準拠）
    case "disconnect":
      return chat.comment; // そのまま表示（NCV準拠）
    default:
      logger.warn(
        `${nicoChatSlice.name}.operatorCmmentParse`,
        `運営コメントは開発者の知らないコマンドでした\n${chat.comment}`
      );
      return chat.comment;
  }
}

/**
 * 放送者コメントの一部はHTMLタグなので、ちゃんとする\
 * 改行を含む文字 => a<br>a
 * lv*等の特定の文字 => <u><font color="#00CCFF"><a href="URL" target="_blank">lv**</a></font></u>
 * @param chat
 * @returns 表示テキスト
 */
function liverCommentParse(chat: ChatMeta): string {
  return chat.comment.replace(/<[^>]*>/g, "");
}
