import { ChatData } from "./CommentData";
import { CommentPingData } from "./CommentPingData";
import { ThreadData } from "./ThreadData";

/**
 * コメント用ウェブソケットが返すメッセージJsonデータタイプ
 */
export type CommentWsMessage =
  { chat: ChatData } |
  { ping: CommentPingData } |
  { thread: ThreadData };

