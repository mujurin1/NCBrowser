import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import BaseTable, { AutoResizer, Column } from 'react-base-table'
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CommentViewItem } from '../types/CommentViewItem';
import { useNicoLive } from './hooks/useNicoLive';
import { makeChatDataToCommentViewItem } from './util/funcs';
import { CommentWebSocket } from './common/CommentWebSocket';
import { usersState } from './atoms/users';
import { logger } from './util/logging';

import 'react-base-table/styles.css';
import '../styles/index.css';
import { chatDataState, useAddChatData } from './atoms/chatData';

const CommentView = (props: {
  comments: CommentViewItem[],
  tableWidth: number,
  tableHeight: number,
  setRef: (ref: BaseTable<CommentViewItem>) => void;
}) =>
  <BaseTable<CommentViewItem> ref={props.setRef}
    data={props.comments}
    estimatedRowHeight={20}
    width={props.tableWidth}
    height={props.tableHeight}
    getScrollbarSize={() => 10}
    // overlayRenderer={<div>HELLO</div>}
    onScroll={({ scrollLeft, scrollTop, horizontalScrollDirection, verticalScrollDirection, scrollUpdateWasRequested }) => {
      console.log("=====================");
      console.log(`スクロール位置左から:${scrollLeft}`);
      console.log(`スクロール位置上から:${scrollTop}`);
      console.log(`スクロールは左から右に？:${horizontalScrollDirection == "forward"}`);
      console.log(`スクロールは上から下に？:${verticalScrollDirection == "forward"}`);
      console.log(`スクロールはユーザーによって？:${!scrollUpdateWasRequested}`);
    }}
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
  const users = useRecoilValue(usersState);
  const addChatData = useAddChatData();
  const chatData = useRecoilValue(chatDataState);

  const { commentMessage, systemWs, commentWs } = useNicoLive(connectingUrl);

  /** コメントが表示されるテーブル */
  let table: BaseTable<CommentViewItem>;
  const setRef = (ref: BaseTable<CommentViewItem>) => table = ref;

  function connect() {
    if (connectingUrl == null)
      setConnectingUrl(liveUrl);
  }

  // 新規コメント取得毎に実行
  useEffect(() => {
    if (commentMessage == null) return;
    
    if ("chat" in commentMessage) {
      addChatData(commentMessage.chat);
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

  useEffect(() => {
    if (chatData == null || table == null) return;

    // 自動スクロールするなら
    if (true) table.scrollToRow(chatData.length - 1, "end");
  }, [chatData]);

  const comments = makeChatDataToCommentViewItem(chatData, users, systemWs?.liveStartTime);
  const menuWidht = 30;
  const bottomPading = 30;

  return <div className="container">
    <div className="menu" >
      <input type="text" id="inputLiveUrl" size={60} value={liveUrl} onChange={e => setLiveUrl(e.target.value)} />
      <button type="submit" id="connectBtn" onClick={connect}>接続</button>
    </div>
    <AutoResizer>
      {({ width, height }) =>
        <CommentView
          comments={comments}
          tableWidth={width}
          tableHeight={height - menuWidht - bottomPading}
          setRef={setRef} />
      }
    </AutoResizer>
  </div >
}

ReactDOM.render(
  <RecoilRoot>
    <CommentViewer />
  </RecoilRoot>,
  document.getElementById('root'));

// type User = {
//   id: string;
//   name: string;
// };

// const usersState = atom({
//   key: "users",
//   default: {
//     A: {
//       id: "A",
//       name: "UserA"
//     },
//     B: {
//       id: "B",
//       name: "UserB"
//     },
//   } as Record<string, User>,
//   dangerouslyAllowMutability: true,
// });

// function MyApp() {
//   const [users, setUsers] = useRecoilState(usersState);

//   return <>
//     <label>userA:{`${users["A"].id}  ${users["A"].name}`}</label>
//     <label>userB:{`${users["B"]?.id}  ${users["B"]?.name}`}</label>
//     <button onClick={() => {
//       setUsers(us => {
//         let newUs = {...us};
//         // newUs["B"] = {id: "B", name: "UserB"}
//         // const upU = {...newUs["A"]};
//         // upU.name = "AAAA";
//         // newUs["A"] = upU;
//         // console.log(us["A"]);
//         // us["A"].name = "NEW";
        
//         if(newUs["B"] == undefined) {
//           newUs = {
//             ...newUs, "B": {id:"B", name: "B"}
//           };
//         }else{
//           console.log(us["B"]);
//           us["B"].name = "new B";
//         }
        
//         // const changeId = "B"
//         // newUs[changeId] = {id:"B", name: "UserB"};
//         return us;
//       })
//     }}>Change</button>
//   </>
// }

// ReactDOM.render(
//   <RecoilRoot>
//     <MyApp />
//   </RecoilRoot>,
//   document.getElementById('root'));
