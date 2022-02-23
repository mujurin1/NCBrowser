import { createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import { connectNicoLive, receiveChat } from "../../api/nicoLiveApi";
import { Schedule } from "../../types/systemWs/Schedule";
import { Statistics } from "../../types/systemWs/Statistics";

export type NicoLiveType = {
  /** 放送コミュニティID */
  communityId: string;
  /** 放送ID */
  liveId: string;
  /** 放送タイトル */
  title: string;
  /** 放送者ID */
  liverId: string;
  /** 放送開始・終了(予定)時刻 */
  schedule: Schedule;
  /** 視聴者数・コメント数等情報 */
  statistics: Statistics;
  /** 接続状態 */
  state: "notConnect" | "waiting" | "connect";
  /** 何かしらエラーが起きた時に入る */
  error: SerializedError;
}

export const changeLive = createAsyncThunk("nicoLive/changeLive", async (liveId: string) => {
  const liveUrl = `https://live.nicovideo.jp/watch/${liveId}`;
  await connectNicoLive(liveUrl);
  await new Promise((resolve) => {
    receiveChat.addOnce(() => {
      resolve(undefined);
    });
  });
});

const nicoLiveSlice = createSlice({
  name: "nicoLive",
  initialState: {} as NicoLiveType,
  reducers: {
    scheduleUpdate: (state, action: PayloadAction<Schedule>) => {
      state.schedule = action.payload;
    },
    statisticsUpdate: (state, action: PayloadAction<Statistics>) => {
      state.statistics = action.payload;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(changeLive.pending, (state, action) => {
        state.state = "waiting";
      })
      .addCase(changeLive.fulfilled, (state, action) => {
        state.state = "connect";
      })
      .addCase(changeLive.rejected, (state, action) => {
        state.state = "notConnect";
        state.error = action.error;
      })
  }
});

export const nicoLiveReducer = nicoLiveSlice.reducer;

export const {
  scheduleUpdate,
  statisticsUpdate
} = nicoLiveSlice.actions;

// export const {
//   changeLive
// } = nicoLiveSlice.actions;

