import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadOptions, saveOptions } from "../api/ncbOptionsApi";
import {
  initialOptions,
  speechApis,
  CommentViewOption,
} from "../api/ncbOptionsApiType";

/**
 * ローカルストレージからオプションを読み取り、\
 * ストアのオプションを更新します
 */
export const loadedOptions = createAsyncThunk("ncbOptions", async () => {
  return await loadOptions();
});

const ncbOptionsSlice = createSlice({
  name: "ncbOptions",
  initialState: initialOptions,
  reducers: {
    saveAll(state, action: PayloadAction) {},
    switchSpeech(state, action: PayloadAction<boolean>) {
      state.yomiage.on = action.payload;
      saveOptions(state);
    },
    changeSpeechApi(state, action: PayloadAction<string>) {
      state.yomiage.useSpeechApi =
        action.payload === speechApis[0]
          ? speechApis[0]
          : action.payload === speechApis[1]
          ? speechApis[1]
          : "ブラウザ読み上げ";
      saveOptions(state);
    },
    updateCommentView(state, action: PayloadAction<CommentViewOption>) {
      state.commentView = action.payload;
      saveOptions(state);
    },
  },
  extraReducers(builder) {
    builder.addCase(loadedOptions.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const ncbOptionReducer = ncbOptionsSlice.reducer;

export const { switchSpeech, changeSpeechApi, updateCommentView } =
  ncbOptionsSlice.actions;
