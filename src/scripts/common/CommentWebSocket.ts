import { logger } from "../util/logging";

/**
 * ニコ生のコメント取得ウェブソケットに関するクラス
 * 
 * XxCaback の解除は`undefined`でなく`() => {}`で行うこと
 */
export class CommentWebSocket {
  private ws: WebSocket;
  private getCommentStartMessage: string;

  /** コメント用ウェブソケットが接続されたら呼ばれる */
  public onOpenWsCallback: (ev: Event) => void = () => { };
  /** コメント用ウェブソケットが閉じられたら呼ばれる */
  public onCloseWsCallback: (ev: CloseEvent) => void = () => { };
  /** コメント用ウェブソケットからエラーが返ったら呼ばれる */
  public onErrorWsCallback: (ev: Event) => void = () => { };
  /** コメント用ウェブソケットからメッセージが返ったら呼ばれる */
  public onMessageWsCallback: (ev: MessageEvent) => void = () => { };

  /**
   * @param commentWsUrl ウェブソケット接続Url
   * @param getCommentStartMessage コメント取得開始メッセージ
   */
  public constructor(commentWsUrl: string, getCommentStartMessage: string) {
    this.getCommentStartMessage = getCommentStartMessage;
    // コメント取得開始メッセージを送信することで、コメントが貰える
    this.ws = new WebSocket(commentWsUrl, "niconama");
    this.ws.onopen = ev => {
      this.doSendComment(this.getCommentStartMessage);
      this.onOpenWsCallback(ev);
    }
    this.ws.onclose = ev => this.onCloseWsCallback(ev);
    this.ws.onmessage = ev => this.onMessageWsCallback(ev);
    this.ws.onerror = ev => this.onErrorWsCallback(ev);
  }

  // コメントセッションへメッセージを送るための関数
  private doSendComment(message: string) {
    logger.info(`SENT TO THE COMMENT SERVER\n${message}`);
    this.ws.send(message);
  }
}
