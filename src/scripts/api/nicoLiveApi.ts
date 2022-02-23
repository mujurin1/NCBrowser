import { Trigger } from "../common/Trigger";
import { Chat } from "../types/commentWs/Chat";
import { CommentWsMessage } from "../types/commentWs/CommentWsMessage";
import { Room } from "../types/systemWs/Room";
import { Schedule } from "../types/systemWs/Schedule";
import { Statistics } from "../types/systemWs/Statistics";
import { SystemPing } from "../types/systemWs/SystemPing";
import { SystemWsMessage } from "../types/systemWs/SystemWsMessage";
import { logger } from "../util/logging";
import { getHTML } from "../util/nico";

// ================= システムウェブソケットのトリガー
const _systemWsOnOpen = new Trigger();
const _systemWsOnMessage = new Trigger<[MessageEvent]>();
const _systemWsOnClose = new Trigger();
const _systemWsOnError = new Trigger<[Event]>();
export const systemWsOnOpen = _systemWsOnOpen.asSetOnlyTrigger();
export const systemWsOnMessage = _systemWsOnMessage.asSetOnlyTrigger();
export const systemWsOnClose = _systemWsOnClose.asSetOnlyTrigger();
export const systemWsOnError = _systemWsOnError.asSetOnlyTrigger();

// ================= コメントウェブソケットのトリガー
const _commentWsOnOpen = new Trigger();
const _commentWsOnMessage = new Trigger<[MessageEvent]>();
const _commentWsOnClose = new Trigger();
const _commentWsOnError = new Trigger<[Event]>();
export const commentWsOnOpen = _commentWsOnOpen.asSetOnlyTrigger();
export const commentWsOnMessage = _commentWsOnMessage.asSetOnlyTrigger();
export const commentWsOnClose = _commentWsOnClose.asSetOnlyTrigger();
export const commentWsOnError = _commentWsOnError.asSetOnlyTrigger();

// ================= システムウェブソケットが受信したデータの型ごとのトリガー
const _receiveSchedule = new Trigger<[Schedule]>();
export const receiveSchedule = _receiveSchedule.asSetOnlyTrigger();
const _receiveStatistics = new Trigger<[Statistics]>();
export const receiveStatistics = _receiveStatistics.asSetOnlyTrigger();

// ================= コメントウェブソケットが受信したデータの型ごとのトリガー
const _receiveChat = new Trigger<[Chat]>();
export const receiveChat = _receiveChat.asSetOnlyTrigger();

// システムウェブソケットに送るメッセージ
const message_system_1 = '{"type":"startWatching","data":{"stream":{"quality":"abr","protocol":"hls","latency":"low","chasePlay":false},"room":{"protocol":"webSocket","commentable":true},"reconnect":false}}';
const message_system_2 = '{"type":"getAkashic","data":{"chasePlay":false}}';

let _systemWs: WebSocket;
let _commentWs: WebSocket;
let _loginUserId: string;
let _wakuStartTime: Date;
let _receiveCommentStartMessage: string;

/**
 * 
 * @param liveUrl 
 * @param userId 
 * @throws 放送ページの応答が異常だった
 */
export async function connectNicoLive(liveUrl: string) {
  // TODO: すでに接続中だったら閉じる処理を書く
  if (_systemWs != null) { }

  const livePage = await getHTML(liveUrl);
  // ======================= System,Commentセッションへの接続
  // 参考: https://qiita.com/pasta04/items/33da06cf3c21e34fc4d1
  /** 大体放送に関する情報がここに集まってる */
  const embeddedData = JSON.parse(livePage.getElementById("embedded-data").getAttribute("data-props"));

  /** システムウェブソケット接続Url */
  const url_system: string = embeddedData.site.relive.webSocketUrl;
  /** コメビュ利用者のユーザーID */
  _loginUserId = embeddedData.user.id ?? "guest";

  _systemWs = new WebSocket(url_system);
  _systemWs.onopen = () => {
    doSendSystem(message_system_1);
    doSendSystem(message_system_2);
    _systemWsOnOpen.fire();
  };
  _systemWs.onmessage = e => {
    onMessageSystem(e);
    _systemWsOnMessage.fire(e);
  };
  _systemWs.onclose = () => _systemWsOnClose.fire();
  _systemWs.onerror = e => _systemWsOnError.fire(e);
}

/**
 * システムウェブソケットへメッセージを送る
 * @param message 
 */
export function doSendSystem(message: string) {
  logger.info(`SENT TO THE SYSTEM SERVER: ${message}`);
  _systemWs.send(message);
}

// コメントセッションへメッセージを送る
export function doSendComment(message: string) {
  logger.info(`SENT TO THE COMMENT SERVER\n${message}`);
  _commentWs.send(message);
}

/**
 * システムウェブソケットがメッセージを受け取ったら呼ばれる
 * @param e 
 */
function onMessageSystem(e: MessageEvent) {
  _systemWsOnMessage.fire(e);

  const message = JSON.parse(e.data) as SystemWsMessage;
  if (message.type === "ping") {
    receivePing(message);
  } else if (message.type === "room") {
    receiveRoom(message);
  } else if (message.type === "schedule") {
    _receiveSchedule.fire(message)
  } else if (message.type === "getAkashic") {
  } else if (message.type === "akashic") {
  } else if (message.type === "seat") {
  } else if (message.type === "serverTime") {
  } else if (message.type === "statistics") {
    _receiveStatistics.fire(message);
  } else if (message.type === "stream") {
  } else {
    logger.warn(
      `システムウェブソケットが受け取ったデータは、開発者がまだ知らない形式でした
      ${message}`
    );
  }
}

/**
 * コメントウェブソケットからメッセージを受け取ってコールバックに渡す仲介
 * @param e 
 */
function receiveCommentWsMessage(e: MessageEvent) {
  _commentWsOnMessage.fire(e);
  const message = JSON.parse(e.data) as CommentWsMessage;
  if ("chat" in message) {
    _receiveChat.fire(message.chat);
  } else if ("ping" in message) {
  } else if ("thread" in message) {
  } else {
    logger.warn(
      `コメントウェブソケットが受信したデータは、開発者がまだ知らない形式でした
      ${message}`
    );
  }
}

/**
 * Pingが来た時に応答する
 * @param message 
 */
function receivePing(message: SystemPing) {
  doSendSystem('{"type":"pong"}');
  doSendSystem('{"type":"keepSeat"}');
}

/**
 * コメントサーバー接続用メッセージが送られたら呼ばれる
 * @param message 
 */
function receiveRoom(message: Room) {
  _wakuStartTime = new Date(message.data.vposBaseTime);

  // 必要な情報を送られてきたメッセージから抽出
  const uri_comment = message.data.messageServer.uri;
  const threadID = message.data.threadId;
  const threadkey = message.data.yourPostKey;
  const threadkeyV = _loginUserId == "guest" ? "" : `,"threadkey":"${threadkey}"`;
  _receiveCommentStartMessage = `[{"ping":{"content":"rs:0"}},{"ping":{"content":"ps:0"}},{"thread":{"thread":"${threadID}","version":"20061206","user_id":"${_loginUserId}","res_from":-150,"with_global":1,"scores":1,"nicoru":0${threadkeyV}}},{"ping":{"content":"pf:0"}},{"ping":{"content":"rf:0"}}]`;
  // コメントセッションとのWebSocket接続を開始
  readyConnectCommentWs(uri_comment);
}

/**
 * コメントウェブソケット接続準備が整ったら呼ばれる
 * @param commentWsUrl 
 */
function readyConnectCommentWs(commentWsUrl: string) {
  _commentWs = new WebSocket(commentWsUrl);
  _commentWs.onopen = () => {
    doSendComment(_receiveCommentStartMessage);
    _commentWsOnOpen.fire();
  };
  _commentWs.onmessage = e => receiveCommentWsMessage(e);
  _commentWs.onclose = () => _commentWsOnClose.fire();
  _commentWs.onerror = e => _commentWsOnError.fire(e);
}
