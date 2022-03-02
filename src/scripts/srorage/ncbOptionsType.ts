// ======================== 定数宣言 ========================
export const ncbOptionsKey = "ncbOptions";

export const speechApis = ["棒読みちゃん", "ブラウザ読み上げ"] as const;

export const columnKeys = ["no", "icon", "name", "time", "comment"] as const;

// ======================== タイプ宣言 ========================
/** オプションストレージ項目 */
export type NcbOptionsStorage = {
  yomiage: YomiageStorage;
  commentView: CommentViewStorage;
};
// ================= 読み上げ =================
export type YomiageStorage = {
  on: boolean;
  useSpeechApi: typeof speechApis[number];
};
// ================= コメントビュー =================
export type ColumnStorage = {
  width: number;
};
export type ColumnsStorage = {
  [P in typeof columnKeys[number]]: ColumnStorage;
};
export type CommentViewStorage = {
  columns: ColumnsStorage;
};

/** オプションストレージ初期値 */
export const initialNcbOptions: NcbOptionsStorage = {
  yomiage: {
    on: false,
    useSpeechApi: "ブラウザ読み上げ",
  },
  commentView: {
    columns: {
      no: {
        width: 65,
      },
      icon: {
        width: 50,
      },
      name: {
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
