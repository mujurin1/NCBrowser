import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";
import {
  commentWsOnMessage,
  connectNicoLive,
  disconnectNicoLive,
} from "../api/nicoLiveApi";
import { LiveInfo } from "../api/nicoLiveApiType";
import { RootState } from "../app/store";
import { Schedule } from "../types/systemWs/Schedule";
import { Statistics } from "../types/systemWs/Statistics";

/**
 * 接続する放送を変更する\
 * `liveId`が`undefined`または空文字なら、切断
 */
export const changeLive = createAsyncThunk(
  "nicoLive/changeLive",
  async (liveId: string, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    if (state.nicoLive.state !== "notConnect") {
      disconnectNicoLive();
    }

    if (liveId == null || liveId === "") {
      // 切断は上で行ってるので、特に何もしない
      throw thunkApi.rejectWithValue("切断しました");
    } else {
      //接続
      const liveUrl = `https://live.nicovideo.jp/watch/${liveId}`;

      const liveInfo = await connectNicoLive(liveUrl);

      document.title = `${liveInfo.title} - ${liveInfo.liverName}`;

      // 放送視聴権限があるかの確認
      if (liveInfo.isFollowerOnly && !liveInfo.isJoined) {
        disconnectNicoLive();
        throw thunkApi.rejectWithValue("視聴権限がありません");
      }

      return await new Promise<LiveInfo>((resolve) => {
        commentWsOnMessage.addOnce(() => {
          resolve(liveInfo);
        });
      });
    }
  }
);

export type NicoLiveType = {
  /** 放送の様々な情報 */
  liveInfo: LiveInfo;
  /** 放送開始・終了(予定)時刻 */
  schedule: Schedule;
  /** 視聴者数・コメント数等情報 */
  statistics: Statistics;
  /**
   * 接続状態\
   * 未接続,接続待機,接続,視聴権限無し
   */
  state: "notConnect" | "waiting" | "connect";
  /** システムメッセージ */
  systemInfo: string[];
};

const nicoLiveSlice = createSlice({
  name: "nicoLive",
  initialState: {
    state: "notConnect",
    systemInfo: [],
  } as NicoLiveType,
  reducers: {
    scheduleUpdate: (state, action: PayloadAction<Schedule>) => {
      state.schedule = action.payload;
    },
    statisticsUpdate: (state, action: PayloadAction<Statistics>) => {
      state.statistics = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(changeLive.pending, (state, action) => {
        state.state = "waiting";
      })
      .addCase(changeLive.fulfilled, (state, action) => {
        state.state = "connect";
        state.liveInfo = action.payload;
      })
      .addCase(changeLive.rejected, (state, action) => {
        state.state = "notConnect";
        state.systemInfo.push(action.payload as string);
      });
  },
});

export const nicoLiveReducer = nicoLiveSlice.reducer;

export const { scheduleUpdate, statisticsUpdate } = nicoLiveSlice.actions;

// export const {
//   changeLive
// } = nicoLiveSlice.actions;
