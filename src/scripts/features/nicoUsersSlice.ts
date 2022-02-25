import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Chat } from "../types/commentWs/Chat";
import { RootState } from "../app/store";
import { parseKotehan } from "../util/funcs";
import { getNicoUserIconUrl, getNicoUserName } from "../util/nico";
import { WritableDraft } from "immer/dist/internal";
import { saveUserKotehan } from "../util/storage";

export type NicoUser = {
  /** ユーザーID */
  userId: string;
  /** 184か */
  anonymous: boolean;
  /**
   * アイコンのURL\
   * （184はダミーURL）
   */
  iconUrl: string;
  /**
   * コテハン\
   * この値が`chrome.storage.local`に保存されている\
   * 無ければこのユーザーIDの値は保存されてない
   */
  kotehan: string | undefined;
  /**
   * コテハンを上書きした時のコメント番号\
   * 初期値-1 コメント以外から取得した場合も -1
   */
  kotehanNo: number | undefined;
};

const usersAdapter = createEntityAdapter<NicoUser>({
  selectId: (model) => model.userId,
});

/**
 * コテハンを上書きする
 * @param state
 * @param payload [ ユーザーID, コテハン, コテハン番号, 強制的に上書きする ]
 */
function setKotehanLogic(
  state: WritableDraft<EntityState<NicoUser>>,
  payload: readonly [string, string, number, boolean]
) {
  const [userId, kotehan, kotehanNo, forced] = payload;
  const user = state.entities[userId];
  if (forced || user.kotehanNo === -1 || user.kotehanNo <= kotehanNo) {
    state.entities[userId].kotehan = kotehan;
    state.entities[userId].kotehanNo = kotehanNo;
    saveUserKotehan(userId, kotehan, user.anonymous);
  }
}

function userChat(state: EntityState<NicoUser>, chat: Chat) {
  const user = state.entities[chat.user_id];
  let [kotehan, kotehanNo] = parseKotehan(chat);
  // 新規ユーザーのコメント
  if (user == null) {
    const anonymous = chat.anonymity === 1;
    usersAdapter.addOne(state, {
      userId: chat.user_id,
      anonymous: anonymous,
      iconUrl: undefined,
      kotehan: kotehan === "" ? undefined : kotehan,
      kotehanNo: kotehanNo,
    });
    if (kotehan.length >= 1) saveUserKotehan(chat.user_id, kotehan, anonymous);
  } else {
    if (kotehan !== "")
      setKotehanLogic(state, [user.userId, kotehan, kotehanNo, false]);
  }
}

const nicoUsersSlice = createSlice({
  name: "nicoUsers",
  initialState: usersAdapter.getInitialState(),
  reducers: {
    receiveChat: (state, action: PayloadAction<Chat>) => {
      userChat(state, action.payload);
    },
    receiveChats: (state, action: PayloadAction<Chat[]>) => {
      action.payload.forEach((chat) => userChat(state, chat));
    },
    setKotehan: (
      state,
      action: PayloadAction<readonly [string, string, number, boolean]>
    ) => {
      setKotehanLogic(state, action.payload);
    },
    setIconUrl: (state, action: PayloadAction<readonly [string, string]>) => {
      const [userId, iconUrl] = action.payload;
      state.entities[userId].iconUrl = iconUrl;
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

export const nicoUsersReducer = nicoUsersSlice.reducer;

export const { receiveChat, receiveChats, setKotehan, setIconUrl } =
  nicoUsersSlice.actions;

export const { selectAll: selectAllNicoUsers, selectById: selectNicoUserById } =
  usersAdapter.getSelectors<RootState>((state) => state.nicoUsers);
