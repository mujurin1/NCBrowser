
/**
 * HTTP応答エラー
 */
export class HttpStatusError extends Error {
  /** 取得先URL */
  public readonly url: string;
  /** HTTPステータスコード */
  public readonly statusCode: number;

  public constructor(url: string, statusCode: number) {
    super(`HTTP応答が異常でした。\nurl:${url}\nstatusCode${statusCode}`);
  }
}
