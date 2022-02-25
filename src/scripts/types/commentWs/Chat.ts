/**
 * コメントデータ型
 * コメントウェブソケットが受信する
 */
export type Chat = {
  /** 多分昔のアリーナなどの部屋IDのなごり？ */
  thread: string;
  /** コメント番号。公式放送は`undefined` */
  no: number;
  /** コメント時刻 枠取得からの経過時刻 (vpos/100 => 秒) */
  vpos: number;
  /** コメント時刻 UNIX時刻(UTC+9) */
  date: number;
  /** コメント時刻 秒未満 */
  date_usec: number;
  /** コマンド */
  mail: string | undefined;
  /** ユーザーID */
  user_id: string;
  /** 1:プレ垢 3:運営コメ */
  premium: number | undefined;
  /** 1:匿名 or 運営コメ */
  anonymity: number | undefined;
  /** コメント内容 */
  content: string;
  /** 1:自分自身のコメント */
  yourpost: number | undefined;
};
