import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { store } from "../../app/store";
import { Chat } from "../../types/commentWs/Chat";
import { parseKotehan } from "../../util/funcs";
import { getNicoUserIconUrl, getNicoUserName } from "../../util/nico";
import { loadUserKotehan, updateUserKotehan } from "../../util/storage";
import { ChatMeta, NicoChat, NicoUser } from "./nicoChatTypes";

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
};

/**
 * 新規ユーザーの情報を更新する
 * @param user
 */
async function newUser(user: NicoUser) {
  if (user.kotehan == undefined) {
    let kotehan = await loadUserKotehan(user.userId, user.anonymous);
    if (!user.anonymous && kotehan == null)
      kotehan = await getNicoUserName(user.userId);

    if (kotehan != null) {
      store.dispatch(updateKotehan([user.userId, kotehan, -1]));
    }
  }
  if (!user.anonymous) {
    const iconUrl = await getNicoUserIconUrl(Number(user.userId));
    store.dispatch(updateIconUrl([user.userId, iconUrl]));
  }
}

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
      if (isNew) newUser(user);
    },
    addChats: (state, action: PayloadAction<Chat[]>) => {
      action.payload.forEach((chat) => {
        const chatMeta = ChatToMeta(chat);
        const [user, isNew] = updateUser(state, chatMeta);
        chatsAdapter.addOne(state.chat, chatMeta);
        usersAdapter.setOne(state.user, user);
        if (isNew) newUser(user);
      });
    },
    chatMetaClear: (state, action: PayloadAction) => {
      chatsAdapter.removeAll(state.chat);
    },
    updateKotehan: (state, action: PayloadAction<[string, string, number]>) => {
      const [userId, kotehan, kotehanStrength] = action.payload;
      KotehanUpdate(state.user.entities[userId], kotehan, kotehanStrength);
    },
    updateIconUrl: (state, action: PayloadAction<[string, string]>) => {
      const [userId, iconUrl] = action.payload;
      state.user.entities[userId].iconUrl = iconUrl;
    },
  },
  extraReducers(builder) {
    builder;
    // extraReducerの見本として残してる
    // .addCase(setIconUrl.fulfilled, (state, action) => {
    //   const [userId, iconUrl] = action.payload;
    //   state.entities[userId].iconUrl = iconUrl;
    // })
  },
});

export const nicoChatReducer = nicoChatSlice.reducer;

export const {
  addChat,
  addChats,
  chatMetaClear,
  updateKotehan,
  updateIconUrl,
} = nicoChatSlice.actions;

/**
 * 状態とチャット情報から更新・作成したユーザー情報を返す
 * @param state
 * @param chatMeta
 * @returns [ユーザー情報, 新規ユーザーか]
 */
function updateUser(state: NicoChat, chatMeta: ChatMeta): [NicoUser, boolean] {
  const [kotehan, kotehanStrength] = parseKotehan(chatMeta);
  let user = state.user.entities[chatMeta.userId];
  const isNew = user == null;
  if (isNew) {
    user = {
      userId: chatMeta.userId,
      type: chatMeta.senderType,
      anonymous: chatMeta.isAnonymity,
      iconUrl: undefined,
      kotehan: kotehan === "" ? undefined : kotehan,
      kotehanStrength: kotehanStrength,
    };
  } else {
    KotehanUpdate(user, kotehan, kotehanStrength);
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

/** ニコニコユーザーのコテハンを更新する */
function KotehanUpdate(
  user: NicoUser,
  kotehan: string,
  kotehanStrength: number
) {
  if (kotehan === "") return;
  if (user.kotehanStrength <= kotehanStrength) {
    user.kotehan = kotehan;
    user.kotehanStrength = kotehanStrength;
    updateUserKotehan(user.userId, kotehan, user.anonymous);
  }
}
