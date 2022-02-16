import { useEffect, useState } from 'react';

import 'react-base-table/styles.css';
import { SystemWebSocket } from '../common/SystemWebSocket';
import { CommentWebSocket } from '../common/CommentWebSocket';
import { CommentWsMessage } from '../../types/commentWs/CommentWsMessage';
import { getHTML } from '../util/nico';
import { logger } from '../util/logging';

type useNicoLiveReturns = {
  commentMessage: CommentWsMessage,
  systemWs: SystemWebSocket,
  commentWs: CommentWebSocket,
};

/**
 * @param liveUrl 放送URL
 * @returns NicoLiveDatas
 */
export function useNicoLive(liveUrl: string): useNicoLiveReturns {
  const [systemWs, setSystemWs] = useState<SystemWebSocket>();
  const [commentWs, setCommentWs] = useState<CommentWebSocket>();
  const [commentMessage, setCommentMessage] = useState<CommentWsMessage>();

  function readyConnectCommentWs(commentWsUrl: string, getCommentStartMessage: string) {
    const _commentWs = new CommentWebSocket(commentWsUrl, getCommentStartMessage);
    _commentWs.onOpenWsCallback = () => logger.info("コメント用ウェブソケット 接続");
    _commentWs.onMessageWsCallback = ev => receiveCommentWsMessage(ev);
    _commentWs.onCloseWsCallback = () => logger.info("コメント用ウェブソケット 終了");
    _commentWs.onErrorWsCallback = ev => logger.error(`コメント用ウェブソケット エラー\n${ev}`);
    setCommentWs(_commentWs);
  }
  function receiveCommentWsMessage(ev: MessageEvent) {
    const commentMessage = JSON.parse(ev.data) as CommentWsMessage;
    setCommentMessage(commentMessage);
  }

  useEffect(() => {
    if (liveUrl == null) return;

    /** システムページDocument */
    getHTML(liveUrl)
      .then(livePage => {
        // 不正なUrl,一時的なサーバーダウンなどの場合はundefinedなので、チェックする
        if (livePage == null) throw new Error(`URL or Server Error\nURL:${liveUrl}`);

        // ======================= System,Commentセッションへの接続
        // 参考: https://qiita.com/pasta04/items/33da06cf3c21e34fc4d1
        /** 大体放送に関する情報がここに集まってる */
        const embeddedData = JSON.parse(livePage.getElementById("embedded-data").getAttribute("data-props"));

        // 放送が終了してないかチェックする
        // if (embeddedData.program.status === "ENDED") {
        //   return;
        // }

        /** システムウェブソケット接続Url */
        const url_system: string = embeddedData.site.relive.webSocketUrl;
        /** コメビュ利用者のユーザーID（未ログインの場合はundefined） */
        const user_id: string = embeddedData.user.id ?? "guest";

        const _systemWs = new SystemWebSocket(url_system, user_id);
        _systemWs.onOpenWsCallback = () => logger.info("システム用ウェブソケット 接続");
        _systemWs.onMessageWsCallback = ev => logger.info(`システム用ウェブソケット 受信: ${ev.data}`);
        _systemWs.onCloseWsCallback = () => logger.info("システム用ウェブソケット 終了");
        _systemWs.onErrorWsCallback = ev => logger.error(`システム用ウェブソケット エラー\n${ev}`);
        _systemWs.readyConnectCallback = (url, startMsg) => readyConnectCommentWs(url, startMsg);
        setSystemWs(_systemWs);
      })
      .catch(e => logger.error(`get HTML Error: ${e}`));
    return () => {
      // ウェブソケットを閉じる処理
    }
  }, [liveUrl]);

  return {
    commentMessage: commentMessage,
    systemWs,
    commentWs: commentWs,
  };
}