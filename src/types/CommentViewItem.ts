
/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  id: string;
  /** コメント番号 */
  no: number;
  /** ユーザーアイコン URL */
  iconUrl: string | "NOT FOUND" | undefined;
  /** ユーザーID */
  userId: string;
  /** ユーザー名 */
  userName: string;
  /** コメント時間 */
  time: string;
  /** コメント内容 */
  comment: string;
}
