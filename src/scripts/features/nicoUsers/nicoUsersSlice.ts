import { createAsyncThunk, createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Chat } from "../../types/commentWs/Chat";
import { RootState } from "../../app/store";
import { parseKotehan } from "../../util/funcs";
import { getNicoUserIconUrl, getNicoUserName } from "../../util/nico";
import { WritableDraft } from "immer/dist/internal";
import { saveUserKotehan } from "../../util/storage";

export type NicoUser = {
  /** ユーザーID */
  userId: string;
  /** 184か */
  anonymous: boolean;
  /**
   * アイコンのURL  
   * （184はダミーURL）
   */
  iconUrl: string;
  /**
   * コテハン  
   * この値が`chrome.storage.local`に保存されている  
   * 無ければこのユーザーIDの値は保存されてない
   */
  kotehan: string | undefined;
  /**
   * コテハンを上書きした時のコメント番号  
   * 初期値-1 コメント以外から取得した場合も -1
   */
  kotehanNo: number | undefined;
}

export const setKotehanFromUserPage = createAsyncThunk("nicoUsers/setKotehanFromUserPage", async (userId: string) => {
  const userName = await getNicoUserName(userId);
  return [userId, userName, -1, false] as const;
});

// iconUrl が存在しなくてもデフォルトURLを返すので絶対にrejectしない
export const setIconUrl = createAsyncThunk("nicoUsers/setIconUrl", async (userId: string) => {
  const iconUrl = await getNicoUserIconUrl(Number(userId));
  return [userId, iconUrl] as const;
});

const usersAdapter = createEntityAdapter<NicoUser>({
  selectId: model => model.userId
});

/**
 * コテハンを上書きする
 * @param state 
 * @param payload [ ユーザーID, コテハン, コテハン番号, 強制的に上書きする ]
 */
function setKotehanLogic(state: WritableDraft<EntityState<NicoUser>>, payload: readonly [string, string, number, boolean]) {
  const [userId, kotehan, kotehanNo, forced] = payload;
  const user = state.entities[userId];
  if (forced || user.kotehanNo === -1 || user.kotehanNo <= kotehanNo) {
    state.entities[userId].kotehan = kotehan;
    state.entities[userId].kotehanNo = kotehanNo;
    saveUserKotehan(userId, kotehan, user.anonymous);
  }
}

const nicoUsersSlice = createSlice({
  name: "nicoUsers",
  initialState: usersAdapter.getInitialState(),
  reducers: {
    receiveChat: (state, action: PayloadAction<Chat>) => {
      const user = state.entities[action.payload.user_id];
      let [kotehan, kotehanNo] = parseKotehan(action.payload);
      // 新規ユーザーのコメント
      if (user == null) {
        const anonymous = action.payload.anonymity === 1;
        usersAdapter.addOne(state, {
          userId: action.payload.user_id,
          anonymous: anonymous,
          iconUrl: undefined,
          kotehan: kotehan === "" ? undefined : kotehan,
          kotehanNo: kotehanNo
        });
        if (kotehan.length >= 1)
          saveUserKotehan(action.payload.user_id, kotehan, anonymous);
      } else {
        if (kotehan !== "")
          setKotehanLogic(state, [user.userId, kotehan, kotehanNo, false]);
      }
    },
    setKotehan: (state, action: PayloadAction<readonly [string, string, number, boolean]>) => {
      setKotehanLogic(state, action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(setKotehanFromUserPage.fulfilled, (state, action) => {
        setKotehanLogic(state, action.payload);
      })
      .addCase(setIconUrl.fulfilled, (state, action) => {
        const [userId, iconUrl] = action.payload;
        state.entities[userId].iconUrl = iconUrl;
      })
  }
});

export const nicoUsersReducer = nicoUsersSlice.reducer;

export const {
  receiveChat,
  setKotehan
} = nicoUsersSlice.actions;

export const {
  selectAll: selectAllNicoUsers,
  selectById: selectNicoUserById,
} = usersAdapter.getSelectors<RootState>(state => state.nicoUsers);
