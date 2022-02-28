import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadOptions,
  OptionsType,
  saveOptions,
  speechApis,
} from "../api/ncbOptionsApi";

/**
 * ローカルストレージからオプションを読み取り、\
 * ストアのオプションを更新します
 */
export const updateOptions = createAsyncThunk("ncbOptions", async () => {
  return await loadOptions();
});

function saveOption(options: OptionsType) {
  saveOptions(options);
}

const ncbOptionsSlice = createSlice({
  name: "ncbOptions",
  initialState: {
    options: {
      general: {},
      yomiage: {
        on: false,
        useSpeechApi: "ブラウザ読み上げ",
      },
    },
  } as OptionsType,
  reducers: {
    switchSpeech(state, action: PayloadAction<boolean>) {
      state.options.yomiage.on = action.payload;
      saveOption(state);
    },
    changeSpeechApi(state, action: PayloadAction<string>) {
      state.options.yomiage.useSpeechApi =
        action.payload === speechApis[0]
          ? speechApis[0]
          : action.payload === speechApis[1]
          ? speechApis[1]
          : "ブラウザ読み上げ";
      saveOption(state);
    },
  },
  extraReducers(builder) {
    builder.addCase(updateOptions.fulfilled, (state, action) => {
      const general = action.payload.options?.general;
      const yomiage = action.payload.options?.yomiage;
      state.options = {
        general: {},
        yomiage: {
          on: yomiage?.on ?? false,
          useSpeechApi: yomiage?.useSpeechApi ?? "ブラウザ読み上げ",
        },
      };
    });
  },
});

export const ncbOptionReducer = ncbOptionsSlice.reducer;

export const { switchSpeech, changeSpeechApi } = ncbOptionsSlice.actions;
