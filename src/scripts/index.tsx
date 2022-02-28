import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { RootState, store, useTypedSelector } from "../scripts/app/store";
import BaseTable, { AutoResizer } from "react-base-table";
import { CommentView, CommentViewItem } from "./components/CommentView";
import {
  commentWsOnOpen,
  batchedComments,
  receiveChat,
  receiveSchedule,
  receiveStatistics,
} from "./api/nicoLiveApi";
import { MenuBar } from "./components/MenuBar";
import { scheduleUpdate, statisticsUpdate } from "./features/nicoLiveSlice";
import { BrowserSpeechAPI } from "./api/browserSpeechApi";
import { bouyomiTalk } from "./api/bouyomiChanApi";
import { loadedOptions } from "./features/ncbOptionsSlice";
import "react-base-table/styles.css";
import "../styles/index.css";
import {
  addChat,
  addChats,
  chatMetaClear,
} from "./features/nicoChat/nicoChatSlice";

// ローカルストレージからオプションをロードする
store.dispatch(loadedOptions());

commentWsOnOpen.add(() => store.dispatch(chatMetaClear()));

// コメントを纏めて取得しおえたら呼ばれる
batchedComments.add((chats) => {
  store.dispatch(addChats(chats));
});

receiveChat.add((chat) => {
  store.dispatch(addChat(chat));
  const state: RootState = store.getState();
  // 読み上げ
  if (state.ncbOption.yomiage.on) {
    switch (state.ncbOption.yomiage.useSpeechApi) {
      case "棒読みちゃん":
        bouyomiTalk(chat.content);
        break;
      case "ブラウザ読み上げ":
        BrowserSpeechAPI.Talk(chat.content);
        break;
    }
  }
});
receiveSchedule.add((schedule) => {
  store.dispatch(scheduleUpdate(schedule));
});
receiveStatistics.add((statistics) => {
  store.dispatch(statisticsUpdate(statistics));
});

const IndexComponent = () => {
  const [table, setTable] = useState<BaseTable<CommentViewItem>>();
  const chatCount = useTypedSelector(
    (state) => Object.keys(state.nicoChat.chat.entities).length
  );

  useEffect(() => {
    if (table == null) return;
  }, [table]);

  // receiveChat.add(() => {
  useEffect(() => {
    // console.log(`自動スクロール ${chatCount}`);
    if (table == null) return;

    // 自動スクロール
    if (true && chatCount > 2) {
      table.scrollToRow(chatCount - 1, "end");
    }
  }, [chatCount]);
  // });

  const menuWidht = 40;
  const bottomPading = 30;
  return (
    <div className="container">
      <MenuBar />
      <AutoResizer>
        {({ width, height }) => (
          <CommentView
            tableSize={{ width, height: height - (menuWidht + bottomPading) }}
            setRef={setTable}
          />
        )}
      </AutoResizer>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <IndexComponent />
      {/* <SpeechTestComponent /> */}
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// function SpeechTestComponent() {
//   const [text, setText] = useState("");

//   return (
//     <>
//       <input type="text" onChange={(e) => setText(e.target.value)} />
//       <br />
//       <button
//         onClick={() => {
//           BrowserSpeechAPI.Talk(text);
//         }}
//       >
//         読み上げキューに追加
//       </button>
//       <br />
//       <button onClick={() => BrowserSpeechAPI.start()}>読み上げ開始</button>
//       <button onClick={() => BrowserSpeechAPI.stop(false)}>読み上げ停止</button>
//       <button onClick={() => BrowserSpeechAPI.stop(true)}>
//         読み上げ停止（読み上げ中のもストップ）
//       </button>
//       <button onClick={() => BrowserSpeechAPI.skip()}>スキップ</button>
//       <br />
//       <hr />
//       <button onClick={() => BrowserSpeechAPI.speechPause()}>
//         発声一時停止
//       </button>
//       <button onClick={() => BrowserSpeechAPI.speechResume()}>発声再開</button>
//       <br />
//     </>
//   );
// }
