import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import BaseTable, { AutoResizer, Column } from 'react-base-table'
import { CommentViewItem } from '../types/CommentViewItem';
import { NicoUser } from '../types/NicoUser';
import { useNicoLive } from './hooks/useNicoLive';
import { calcDateToFomat, createIconUrl, loadUserCotehan, saveUserKotehan } from './util/funcs';
import { ChatData } from '../types/commentWs/ChatData';
import { getNicoUserName } from './util/nico';
import { CommentWebSocket } from './common/CommentWebSocket';

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
    <Column flexShrink={0} resizable={true} className="column_icon"
      key="icon" dataKey="iconUrl"
      title="アイコン" width={50}
      cellRenderer={
        ({ cellData: iconUrl }) =>
          iconUrl == "NOT FOUND" ? <></> : <img src={iconUrl}></img>
      }
    />
    <Column<CommentViewItem> flexShrink={0} resizable={true} key="userName" dataKey="userName"
      title="ユーザー名" width={100}
      cellRenderer={({ cellData, rowData }) =>
        <div className="not_estimate">{cellData ?? rowData.userId}</div>}
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
  const [users, setUsers] = useState<{ [key: string]: NicoUser }>({});

  const { commentMessage, systemWs, commentWs } = useNicoLive(connectingUrl);

  /**
   * ユーザーにコテハンをセットする
   * @param userId コテハンを付けるユーザーID
   * @param kotehan コテハン undefinedなら削除
   * @param kotehanNo コテハンを設定する強さ
   * @param isSave chrome.storage.localに保存するか
   */
  function setKotehan(userId: string, kotehan: string | undefined, kotehanNo: number, isSave: boolean) {
    setUsers(oldUsers => {
      // 多分ない
      if (oldUsers[userId] == null) {
        console.log("=========================================");
        console.log("これが表示されたら、index.tsxのsetKotehan().の該当箇所のコメントアウトを外す");
        console.log("これが表示されたら、index.tsxのsetKotehan().の該当箇所のコメントアウトを外す");
        console.log("これが表示されたら、index.tsxのsetKotehan().の該当箇所のコメントアウトを外す");
        console.log("=========================================");
      }
      // // oldUsers に userId のデータがない場合がある
      // if (oldUsers[userId] == null) {
      //   console.log("KOTEHAN RELOAD");

      //   setTimeout(() => setKotehan(userId, kotehan, kotehanNo, isSave), 1000);
      //   return oldUsers;
      // }

      if (oldUsers[userId].kotehanNo > kotehanNo) {
        return oldUsers;
      }

      const _oldUsers = { ...oldUsers };
      _oldUsers[userId].kotehan = kotehan;
      _oldUsers[userId].kotehanNo = kotehanNo;
      if (isSave)
        saveUserKotehan(userId, kotehan, _oldUsers[userId].anonymous);
      return _oldUsers;
    });
  }

  function setIconUrl(userId: number) {
    const iconUrl = createIconUrl(userId);
    fetch(iconUrl)
      .then(page => {
        if (!page.ok) throw new Error(page.statusText);
        setUsers(oldUsers => {
          const _oldUsers = { ...oldUsers };
          _oldUsers[userId].iconUrl = iconUrl;
          return _oldUsers;
        });
      })
      .catch(_ => setUsers(oldUsers => {
        const _oldUsers = { ...oldUsers };
        _oldUsers[userId].iconUrl = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";
        return _oldUsers;
      }));
  }

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

      // 新規ユーザー
      if (user == null) {
        const anonymous = chat.anonymity === 1;
        user = {
          userId: chat.user_id,
          anonymous: anonymous,
          // iconUrl: anonymous ? "NOT FOUND" : createIconUrl(parseInt(chat.user_id)),
          iconUrl: anonymous ? "NOT FOUND" : undefined,
          kotehan: undefined,
          kotehanNo: -1,
        };
        newUser = true;
        if (!user.anonymous) setIconUrl(parseInt(user.userId));

        // ユーザー名取得
        loadUserCotehan(user.userId, user.anonymous)
          .then(kotehan => {
            if (kotehan != null)        // chrome.storage.localから取得
              setKotehan(user.userId, kotehan, -1, false);
            else if (!user.anonymous)   // ニコニコユーザーページから取得
              getNicoUserName(user.userId)
                .then(kotehan => setKotehan(user.userId, kotehan, -1, true));
          });
      }

      // コテハン
      if (chat.premium != 3 || !user.anonymous) {
        let _content = chat.content.replace("＠", "@");
        _content = _content.replace("　", " ");
        const index = _content.indexOf("@");
        if (0 <= index && index < _content.length) {
          let kotehan = undefined;
          if (_content[index + 1] == " ") { // @の次が空白だったら、コテハン削除
            // kotehan = undefined;
          } else {
            kotehan = _content.substring(index + 1, _content.length).split(" ")[0];
          }
          setKotehan(chat.user_id, kotehan, chat.no, true);
        }
      }

      if (newUser) {
        setUsers(oldUsers => {
          return { ...oldUsers, [user.userId]: user };
        });
      }
    } else if ("ping" in commentMessage) {
      const ping = commentMessage.ping;
    } else if ("thread" in commentMessage) {
      const thread = commentMessage.thread;
    } else {
      console.log(`${CommentWebSocket.name} が受け取ったデータは、開発者がまだ知らない形式でした。`);
      console.log("======================= new Type =======================");
      console.log(commentMessage);
      console.log("======================= new Type =======================");
    }
  }, [commentMessage]);

  const comments = commentDatas.map((chat) => {
    const user = users[chat.user_id];

    return {
      id: `${chat.no}`,
      no: chat.no,
      iconUrl: user?.iconUrl,   // タイミング次第ではuserが存在しないことがある
      userId: chat.user_id,
      userName: user?.kotehan,
      time: calcDateToFomat(new Date(chat.date * 1000), systemWs.liveStartTime),
      comment: chat.content
    } as CommentViewItem;
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

ReactDOM.render(<CommentViewer />, document.getElementById('root'));
