
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
