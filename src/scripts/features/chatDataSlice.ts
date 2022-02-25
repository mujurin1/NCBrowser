import {
  createAction,
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { Chat } from "../types/commentWs/Chat";
import { RootState } from "../app/store";
import {
  receiveChat,
  receiveChats,
  setIconUrl,
  setKotehan,
} from "./nicoUsersSlice";
import { loadUserKotehan } from "../util/storage";
import { getNicoUserIconUrl, getNicoUserName } from "../util/nico";
import { sleep } from "../util/funcs";

export const addChats = createAsyncThunk(
  "chatData/addChats",
  async (chats: Chat[], { dispatch, getState }) => {
    const state = getState() as RootState;
    dispatch(receiveChats(chats));
    dispatch(
      chatDataSlice.actions.addChatsData(chats.map((chat) => ChatToMeta(chat)))
    );

    chats.forEach(async (chat) => await chatDoActions(state, dispatch, chat));
  }
);

export const addChat = createAsyncThunk(
  "chatData/addChat",
  async (chat: Chat, { dispatch, getState }) => {
    const state = getState() as RootState;

    dispatch(receiveChat(chat));
    dispatch(chatDataSlice.actions.addChatData(ChatToMeta(chat)));

    await chatDoActions(state, dispatch, chat);
  }
);

async function chatDoActions(
  state: RootState,
  dispatch: ThunkDispatch<any, any, any>,
  chat: Chat
) {
  const anonymity = chat.anonymity === 1;

  let kotehan = await loadUserKotehan(chat.user_id, anonymity);
  // 新規ユーザーかつ生ID
  if (state.nicoUsers.entities[chat.user_id] == null && !anonymity) {
    kotehan ??= await getNicoUserName(chat.user_id);
    const iconUrl = await getNicoUserIconUrl(Number(chat.user_id));
    dispatch(setIconUrl([chat.user_id, iconUrl]));
  }
  if (kotehan != null) dispatch(setKotehan([chat.user_id, kotehan, -1, false]));
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
    isOfficial: chat.premium === 3,
    comment: chat.content,
    yourpost: chat.yourpost === 1,
  };
}

const chatDataAdapter = createEntityAdapter<ChatMeta>({
  selectId: (model) => model.nanoId,
  sortComparer: (a, b) => (a.no != null ? a.no - b.no : a.date - b.date),
});

export type ChatMeta = {
  /** 一意なID */
  nanoId: string;
  /** コメント番号。公式放送は`undefined` */
  no: number;
  /** コメント時刻 UNIX時刻(UTC+9) */
  date: number;
  /** コマンド */
  mail: string | undefined;
  /** ユーザーID */
  userId: string;
  /** プレ垢か？ */
  isPremium: boolean;
  /** 184か？ */
  isAnonymity: boolean;
  /** 運営コメントか？ */
  isOfficial: boolean;
  /** コメント */
  comment: string;
  /** 自分自身のコメントか */
  yourpost: boolean;
};

const chatDataSlice = createSlice({
  name: "chatData",
  initialState: chatDataAdapter.getInitialState(),
  reducers: {
    addChatData: (state, action: PayloadAction<ChatMeta>) => {
      chatDataAdapter.addOne(state, action.payload);
    },
    addChatsData: (state, action: PayloadAction<ChatMeta[]>) => {
      chatDataAdapter.addMany(state, action.payload);
    },
    chatAllClear: (state) => {
      chatDataAdapter.removeAll(state);
    },
  },
  extraReducers(builder) {
    builder;
  },
});

export const chatDataReducer = chatDataSlice.reducer;

export const { chatAllClear } = chatDataSlice.actions;

export const {
  selectAll: selectAllChatDataUsers,
  selectById: selectChatDataById,
} = chatDataAdapter.getSelectors<RootState>((state) => state.chatData);
