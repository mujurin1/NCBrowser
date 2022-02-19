import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import BaseTable, { AutoResizer, Column } from 'react-base-table'
import { useRecoilState, RecoilRoot, atom, selectorFamily, useRecoilValue } from 'recoil';

import { CommentViewItem } from '../types/CommentViewItem';
import { useNicoLive } from './hooks/useNicoLive';
import { calcDateToFomat, loadUserCotehan, parseKotehan } from './util/funcs';
import { ChatData } from '../types/commentWs/ChatData';
import { CommentWebSocket } from './common/CommentWebSocket';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { usersState, useSetIconUrl, useSetKotehan, useSetKotehanFromNicoUserPage } from './data/users';
import { logger } from './util/logging';

import 'react-base-table/styles.css';
import '../styles/index.css';

const CommentView = (props: { comments: CommentViewItem[], tableWidth: number, tableHeight: number }) =>
  <BaseTable<CommentViewItem>
    data={props.comments}
    estimatedRowHeight={20}
    width={props.tableWidth}
    height={props.tableHeight}
    getScrollbarSize={() => 10}
  // overlayRenderer={<div>HELLO</div>}
  >
    <Column flexShrink={0} resizable={true} className="column_no"
      key="no" dataKey="no" title="コメ番" width={65}
    />
    <Column<CommentViewItem> flexShrink={0} resizable={true} className="column_icon"
      key="icon" dataKey="iconUrl"
      title="アイコン" width={50}
      cellRenderer={
        ({ rowData }) =>
          rowData.anonymous ? <></> : <img src={rowData.iconUrl}></img>
      }
    />
    <Column<CommentViewItem> flexShrink={0} resizable={true} key="userName" dataKey="userName"
      title="ユーザー名" width={100}
      cellRenderer={({ cellData, rowData }) =>
        <div className="not_estimate">{rowData.kotehan ?? rowData.userId}</div>}
    />
    <Column flexShrink={0} resizable={true} className="column_time"
      key="time" dataKey="time" title="時間" width={50}
    />
    <Column flexShrink={1} resizable={false} flexGrow={1}
      key="comment" dataKey="comment" title="コメント" width={400}
    />
  </BaseTable>

function CommentViewer(props: {}) {
  const [liveUrl, setLiveUrl] = useState("https://live.nicovideo.jp/watch/co3860320");
  const [connectingUrl, setConnectingUrl] = useState<string>();
  const [commentDatas, setCommentDatas] = useState<ChatData[]>([]);
  const [users, setUsers] = useRecoilState(usersState);
  const setKotehan = useSetKotehan();
  const setKotehanFromNicoUserPage = useSetKotehanFromNicoUserPage();
  const setIconUrl = useSetIconUrl();

  const { commentMessage, systemWs, commentWs } = useNicoLive(connectingUrl);

  function connect() {
    if (connectingUrl == null)
      setConnectingUrl(liveUrl);
  }

  // 新規コメント取得毎に実行
  useEffect(() => {
    if (commentMessage == null) return;

    if ("chat" in commentMessage) {
      const chat = commentMessage.chat;
      setCommentDatas(oldData => [...oldData, chat]);
      let user = users[chat.user_id];
      let newUser = false;

      let kotehan = "";
      if (!(chat.premium === 3 && chat.anonymity == 1)) {
        kotehan = parseKotehan(chat.content);
      }

      // 新規ユーザー
      if (user == null) {
        const anonymous = chat.anonymity === 1;
        user = {
          userId: chat.user_id,
          anonymous: anonymous,
          iconUrl: undefined,
          kotehan: kotehan === "" ? undefined : kotehan,
          kotehanNo: -1,
        };
        newUser = true;

        setUsers(oldUsers => {
          return { ...oldUsers, [user.userId]: user };
        });

        if (!user.anonymous) setIconUrl(parseInt(user.userId));

        // ユーザー名取得
        loadUserCotehan(user.userId, user.anonymous)
          .then(kotehan => {
            if (kotehan != null)        // chrome.storage.localから取得
              setKotehan(user.userId, kotehan, -1, false);
            else if (!user.anonymous)   // ニコニコユーザーページから取得
              setKotehanFromNicoUserPage(user.userId);
          });
      } else {  // すでに存在するユーザー
        if (kotehan !== "")
          setKotehan(chat.user_id, kotehan, chat.no, true);
      }
    } else if ("ping" in commentMessage) {
      const ping = commentMessage.ping;
    } else if ("thread" in commentMessage) {
      const thread = commentMessage.thread;
    } else {
      logger.warn(
        `${CommentWebSocket.name} が受け取ったデータは、開発者がまだ知らない形式でした
        ${commentMessage}`
      );
    }
  }, [commentMessage]);

  const comments = commentDatas.map((chat): CommentViewItem => {
    const user = users[chat.user_id];
    return {
      id: `${chat.no}`,
      anonymous: user.anonymous,  // タイミング次第ではuserが存在しないことがある?
      no: chat.no,
      iconUrl: user.iconUrl,
      userId: chat.user_id,
      kotehan: user.kotehan,
      time: calcDateToFomat(new Date(chat.date * 1000), systemWs.liveStartTime),
      comment: chat.content
    };
  });

  const menuWidht = 30;
  const bottomPading = 30;

  return <div className="container">
    <div className="menu" >
      <input type="text" id="inputLiveUrl" size={60} value={liveUrl} onChange={e => setLiveUrl(e.target.value)} />
      <button type="submit" id="connectBtn" onClick={connect}>接続</button>
    </div>
    <AutoResizer>
      {({ width, height }) =>
        <CommentView comments={comments} tableWidth={width} tableHeight={height - menuWidht - bottomPading} />
      }
    </AutoResizer>
  </div >
}

ReactDOM.render(
  <RecoilRoot>
    <CommentViewer />
  </RecoilRoot>,
  document.getElementById('root'));
