import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { AppState, storageSelector, store } from "../scripts/app/store";
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
import {
  chatMetaClear,
  receiveNicoChat,
} from "./features/nicoChat/nicoChatSlice";
import { loadAllStorageThunk } from "./features/storageSlice";
import { CommentView } from "./components/CommentView";
import { Resizer } from "./components/Resizer";

import "../styles/index.css";

// ローカルストレージからオプションをロードする
store.dispatch(loadAllStorageThunk());

commentWsOnOpen.add(() => store.dispatch(chatMetaClear()));

// コメントを纏めて取得しおえたら呼ばれる
batchedComments.add((chats) => {
  store.dispatch(receiveNicoChat(chats));
});

receiveChat.add((chat) => {
  store.dispatch(receiveNicoChat([chat]));
  const state: AppState = store.getState();
  const storage = storageSelector(state);
  // 読み上げ
  if (storage.ncbOptions.yomiage.on) {
    switch (storage.ncbOptions.yomiage.useSpeechApi) {
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

function ReactWindowTest() {
  const menuHeight = 40;
  const bottomPading = 30;
  return (
    <div className="container" style={{}}>
      <MenuBar className="content" />
      <Resizer>
        {(size) => (
          <CommentView
            className="content"
            width={size.width}
            height={size.height - (menuHeight + bottomPading)}
          />
        )}
      </Resizer>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactWindowTest />
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
