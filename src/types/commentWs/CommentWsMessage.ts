import { Chat } from "./Chat";
import { CommentPing } from "./CommentPing";
import { Thread } from "./Thread";

/**
 * コメント用ウェブソケットが返すメッセージJsonデータタイプ
 */
export type CommentWsMessage =
  { chat: Chat } |
  { ping: CommentPing } |
  { thread: Thread };

