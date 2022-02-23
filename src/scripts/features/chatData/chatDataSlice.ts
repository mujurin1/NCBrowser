import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Chat } from "../../types/commentWs/Chat";
import { RootState } from "../../app/store";
import { receiveChat, setIconUrl, setKotehanFromUserPage } from "../nicoUsers/nicoUsersSlice";
import { loadUserKotehan } from "../../util/storage";

const chatDataAdapter = createEntityAdapter<Chat>({
  selectId: model => model.no
});

/**
 * 新しくチャットが来たら
 * * chatDataにchatを追加
 * * 新しいユーザーのchatならusersにuserを追加
 *   * ローカルストレージからユーザー情報を取得・反映
 *   * 生IDならアイコンを取得・設定
 *   * 生IDでコテハンが無いなら生IDを取得・設定
 * * コメントにコテハンが含まれていればコテハンをセット
 */;

export const addChat = createAsyncThunk("chatData/addChat", async (chat: Chat, { dispatch, getState }) => {
  const anonymity = chat.anonymity !== 1;
  const state = getState() as RootState;
  dispatch(receiveChat(chat));
  dispatch(chatDataSlice.actions.addChatData(chat));
  let kotehan = await loadUserKotehan(chat.user_id, anonymity);
  if (state.nicoUsers.entities[chat.user_id] == null && anonymity) {
    if (kotehan == null)
      dispatch(setKotehanFromUserPage(chat.user_id));
    dispatch(setIconUrl(chat.user_id));
  }
});

const chatDataSlice = createSlice({
  name: "chatData",
  initialState: chatDataAdapter.getInitialState(),
  reducers: {
    addChatData: (state, action: PayloadAction<Chat>) => {
      chatDataAdapter.addOne(state, action.payload);
    },
    chatAllClear: (state) => {
      chatDataAdapter.removeAll(state);
    }
  },
  extraReducers(builder) {
    builder
  }
});

export const chatDataReducer = chatDataSlice.reducer;

export const {
  chatAllClear
} = chatDataSlice.actions;

export const {
  selectAll: selectAllChatDataUsers,
  selectById: selectChatDataById,
} = chatDataAdapter.getSelectors<RootState>(state => state.chatData);
