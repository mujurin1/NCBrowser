import { RoomData } from "../../types/systemWs/RoomData";
import { SystemPingData } from "../../types/systemWs/SystemPingData";
import { SystemWsMessage } from "../../types/systemWs/SystemWsMessage";
import { logger } from "../util/logging";

/**
 * システムウェブソケットに関するクラス
 * 
 * XxCaback の解除は`undefined`でなく`() => {}`で行うこと
 */
export class SystemWebSocket {
  // websocketでセッションに送るメッセージ
  static readonly message_system_1 = '{"type":"startWatching","data":{"stream":{"quality":"abr","protocol":"hls","latency":"low","chasePlay":false},"room":{"protocol":"webSocket","commentable":true},"reconnect":false}}';
  static readonly message_system_2 = '{"type":"getAkashic","data":{"chasePlay":false}}';

  private _ws: WebSocket;
  private _loginUserId: string;

  private _wakuStartTime: Date;
  private _liveStartTime: Date;
  private _liveEndTime: Date;

  /**
   * ログインしてるユーザーのID  
   * ログインして無ければ`guest`
   */
  public get loginUserId() {
    return this._loginUserId;
  }

  /**
   * 枠開始時刻 (RoomData.vposBaseTime)  
   * **vposは曖昧なので、使うのは非推奨です。**
   */
  public get wakuStartTime() {
    return this._wakuStartTime;
  }
  /** 放送開始時刻 (ScheduleData.begin) */
  public get liveStartTime() {
    return this._liveStartTime;
  }
  /** 放送終了予定時刻 (ScheduleData.end) */
  public get liveEndTime() {
    return this._liveEndTime;
  }

  /**
   * コメントウェブソケットと接続する準備が終わったら呼ばれる  
   * @param commentWsUrl コメントウェブソケット接続先URL
   * @param getCommentStartMessage コメント取得開始メッセージ
   */
  public readyConnectCallback: (commentWsUrl: string, getCommentStartMessage: string) => void;

  /** システム用ウェブソケットが接続されたら呼ばれる */
  public onOpenWsCallback: (ev: Event) => void = () => { };
  /** システム用ウェブソケットが閉じられたら呼ばれる */
  public onCloseWsCallback: (ev: CloseEvent) => void = () => { };
  /** システム用ウェブソケットからエラーが返ったら呼ばれる */
  public onErrorWsCallback: (ev: Event) => void = () => { };
  /** システム用ウェブソケットからメッセージが返ったら呼ばれる */
  public onMessageWsCallback: (ev: MessageEvent) => void = () => { };

  /**
   * @param systemWsUrl ウェブソケット接続Url
   * @param userId ユーザーID
   */
  public constructor(systemWsUrl: string, userId: string) {
    this._loginUserId = userId;
    this._ws = new WebSocket(systemWsUrl);
    this._ws.onopen = this.onOpenSystem.bind(this);
    this._ws.onclose = this.onCloseWsCallback.bind(this);
    this._ws.onmessage = this.onMessageSystem.bind(this);
    this._ws.onerror = this.onErrorWsCallback.bind(this);
  }

  /** システムセッションとのWebSocket接続が開始された時に実行される */
  private onOpenSystem(ev: Event) {
    this.onOpenWsCallback(ev);
    this.doSendSystem(SystemWebSocket.message_system_1);
    this.doSendSystem(SystemWebSocket.message_system_2);
  }

  /** システムセッションとのWebSocket接続中にメッセージを受け取った時に実行される */
  private onMessageSystem(ev: MessageEvent) {
    this.onMessageWsCallback(ev);

    const systemJson = JSON.parse(ev.data) as SystemWsMessage;
    if (systemJson.type === "ping") {
      this.receivePing(systemJson);
    } else if (systemJson.type === "room") {
      this.receiveRoom(systemJson);
    } else if (systemJson.type === "schedule") {
      this._liveStartTime ??= new Date(systemJson.data.begin);
      this._liveEndTime = new Date(systemJson.data.end);
    } else if (systemJson.type === "getAkashic") {
    } else if (systemJson.type === "akashic") {
    } else if (systemJson.type === "seat") {
    } else if (systemJson.type === "serverTime") {
    } else if (systemJson.type === "statistics") {
    } else if (systemJson.type === "stream") {
    } else {
      logger.warn(
        `${SystemWebSocket.name} が受け取ったデータは、開発者がまだ知らない形式でした
        ${systemJson}`
      );
    }
  }

  /** システムセッションへメッセージを送る */
  private doSendSystem(message: string) {
    logger.info(`SENT TO THE SYSTEM SERVER: ${message}`);
    this._ws.send(message);
  }

  /** Pingが来た時に応答する */
  private receivePing(message: SystemPingData) {
    this.doSendSystem('{"type":"pong"}');
    this.doSendSystem('{"type":"keepSeat"}');
  }

  private receiveRoom(message: RoomData) {
    this._wakuStartTime = new Date(message.data.vposBaseTime);

    // 必要な情報を送られてきたメッセージから抽出
    const uri_comment = message.data.messageServer.uri;
    const threadID = message.data.threadId;
    const threadkey = message.data.yourPostKey;
    const threadkeyV = this._loginUserId == "guest" ? "" : `,"threadkey":"${threadkey}"`;
    const message_comment = `[{"ping":{"content":"rs:0"}},{"ping":{"content":"ps:0"}},{"thread":{"thread":"${threadID}","version":"20061206","user_id":"${this._loginUserId}","res_from":-150,"with_global":1,"scores":1,"nicoru":0${threadkeyV}}},{"ping":{"content":"pf:0"}},{"ping":{"content":"rf:0"}}]`;
    // コメントセッションとのWebSocket接続を開始
    this.readyConnectCallback(uri_comment, message_comment);
  }





}
