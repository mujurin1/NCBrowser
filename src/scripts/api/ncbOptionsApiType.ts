// ======================== 列挙型宣言 ========================
export const speechApis = ["棒読みちゃん", "ブラウザ読み上げ"] as const;

export const columnKeys = [
  "no",
  "iconUrl",
  "kotehan",
  "time",
  "comment",
] as const;

// ======================== タイプ宣言 ========================

// ================= 読み上げ =================
export type YomiageOption = {
  on: boolean;
  useSpeechApi: typeof speechApis[number];
};
// ================= コメントビュー =================
export type ColumnOption = {
  width: number;
};
export type ColumnOptions = { [P in typeof columnKeys[number]]: ColumnOption };
export type CommentViewOption = {
  columns: ColumnOptions;
};

// ======================== オプション ========================
export type OptionsType = {
  general: {};
  yomiage: YomiageOption;
  commentView: CommentViewOption;
};

// ======================== オプション既定値 ========================
export const initialOptions: OptionsType = {
  general: {},
  yomiage: {
    on: false,
    useSpeechApi: "ブラウザ読み上げ",
  },
  commentView: {
    columns: {
      no: {
        width: 65,
      },
      iconUrl: {
        width: 50,
      },
      kotehan: {
        width: 100,
      },
      time: {
        width: 50,
      },
      comment: {
        width: 400,
      },
    },
  },
};
