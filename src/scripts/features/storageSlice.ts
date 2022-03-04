import {
  ActionCreatorWithOptionalPayload,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { BrowserSpeechAPI } from "../api/browserSpeechApi";
import { AppState } from "../app/store";
import {
  AllStorage,
  initialAllStorage,
  loadAllStorage,
  saveAllStorage,
} from "../srorage/all";
import { saveNcbOptions } from "../srorage/ncbOptions";
import { speechApis, CommentViewStorage } from "../srorage/ncbOptionsType";
import {
  nicoUsersAnonymityKey,
  nicoUsersRealKey,
  NicoUserStorage,
} from "../srorage/nicoUsersType";
import { logger } from "../util/logging";
import { NicoUser } from "./nicoChat/nicoChatTypes";

/**
 * ローカルストレージからデータを読み取り、\
 * ストアのオプションを更新します
 */
export const loadAllStorageThunk = createAsyncThunk(
  "storage/loadStorage",
  async () => {
    return await loadAllStorage();
  }
);

function createUpdateThunk<ValueT>(
  prefix: string,
  action: ActionCreatorWithOptionalPayload<ValueT, string>
) {
  return createAsyncThunk(
    `storage/${prefix}`,
    (value: ValueT, { dispatch, getState }) => {
      dispatch(action(value));
      const state = getState() as AppState;
      saveAllStorage(state.storage.storage);
    }
  );
}

export type storageType = {
  storage: AllStorage;
  /** ストレージを読み書き中か */
  locked: boolean;
};

const storageSlice = createSlice({
  name: "storage",
  initialState: {
    storage: initialAllStorage,
    locked: false,
  } as storageType,
  reducers: {
    switchSpeech(state, action: PayloadAction<boolean>) {
      state.storage.ncbOptions.yomiage.on = action.payload;
    },
    changeSpeechApi(state, action: PayloadAction<typeof speechApis[number]>) {
      state.storage.ncbOptions.yomiage.useSpeechApi = action.payload;
    },
    updateCommentView(state, action: PayloadAction<CommentViewStorage>) {
      state.storage.ncbOptions.commentView = action.payload;
    },
    updateNicoUser(state, action: PayloadAction<NicoUser>) {
      const user = action.payload;
      const key = user.anonymous ? nicoUsersAnonymityKey : nicoUsersRealKey;
      state.storage.nicoUsers[key][user.userId] = {
        kotehan: user.kotehan,
        userId: user.iconUrl,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadAllStorageThunk.pending, (state, action) => {
        state.locked = true;
        return state;
      })
      .addCase(loadAllStorageThunk.fulfilled, (state, action) => {
        state.locked = false;
        state.storage = action.payload;
        return state;
      })
      .addCase(loadAllStorageThunk.rejected, (state, action) => {
        state.locked = false;
        logger.error(
          "Storage.LoadAllStorage",
          "ストレージの読み取りに失敗しました"
        );
        return state;
      });
  },
});

export const storageReducer = storageSlice.reducer;

// ActionThunk
export const switchSpeech = createUpdateThunk(
  "switchSpeech",
  storageSlice.actions.switchSpeech
);
export const changeSpeechApi = createUpdateThunk(
  "changeSpeechApi",
  storageSlice.actions.changeSpeechApi
);
export const updateCommentView = createUpdateThunk(
  "updateCommentView",
  storageSlice.actions.updateCommentView
);
export const updateNicoUser = createUpdateThunk(
  "updateNicoUser",
  storageSlice.actions.updateNicoUser
);
