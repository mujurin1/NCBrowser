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
import { getNicoUserIconUrl, getNicoUserName } from "../../util/nico";
import { updateNicoUser } from "../storageSlice";
import { ChatMeta, NicoChat, NicoUser } from "./nicoChatTypes";

export const receiveNicoChat = createAsyncThunk(
  "nicoChat/receiveChat",
  async (chats: Chat[], { dispatch }) => {
    if (chats.length === 1) dispatch(nicoChatSlice.actions.addChat(chats[0]));
    else dispatch(nicoChatSlice.actions.addChats(chats));
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
  sortComparer: (a, b) => (a.no != null ? a.no - b.no : a.date - b.date),
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
    addChat: (state, action: PayloadAction<Chat>) => {
      const chat = action.payload;
      const chatMeta = ChatToMeta(chat);
      const [user, isNew] = updateUser(state, chatMeta);
      chatsAdapter.addOne(state.chat, chatMeta);
      usersAdapter.setOne(state.user, user);
      if (isNew) state.transactionUserIds[user.userId] = undefined;
    },
    addChats: (state, action: PayloadAction<Chat[]>) => {
      action.payload.forEach((chat) => {
        const chatMeta = ChatToMeta(chat);
        const [user, isNew] = updateUser(state, chatMeta);
        chatsAdapter.addOne(state.chat, chatMeta);
        usersAdapter.setOne(state.user, user);
        if (isNew) state.transactionUserIds[user.userId] = undefined;
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
      anonymous: chatMeta.isAnonymity,
      iconUrl: undefined,
      kotehan: kotehan === "" ? undefined : kotehan,
    };
  }
  return [user, isNew];
}

function ChatToMeta(chat: Chat): ChatMeta {
  return {
    nanoId: nanoid(),
    no: chat.no,
    date: chat.date,
    mail: chat.mail,
    userId: chat.user_id,
    isPremium: chat.premium === 1,
    isAnonymity: chat.anonymity === 1,
    senderType:
      chat.premium === 3
        ? chat.anonymity === 1
          ? "Operator"
          : "Liver"
        : "Listner",
    comment: chat.content,
    yourpost: chat.yourpost === 1,
  };
}

// /** ニコニコユーザーのコテハンを更新する */
// function KotehanUpdate(
//   user: NicoUser,
//   kotehan: string,
//   kotehanStrength: number
// ) {
//   if (kotehan === "") return;
//   if (user.kotehanStrength <= kotehanStrength) {
//     user.kotehan = kotehan;
//     user.kotehanStrength = kotehanStrength;
//     updateUserKotehan(user.userId, kotehan, user.anonymous);
//   }
// }
