
/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  id: string;
  /** 匿名か */
  anonymous: boolean;
  /** コメント番号 */
  no: number;
  /** ユーザーアイコン URL */
  iconUrl: string | undefined;
  /** ユーザーID */
  userId: string;
  /** コテハン */
  kotehan: string;
  /** コメント時間 */
  time: string;
  /** コメント内容 */
  comment: string;
}
