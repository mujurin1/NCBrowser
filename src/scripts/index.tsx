import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {
  AppState,
  nicoChatSelector,
  nicoLiveSelector,
  storageSelector,
  store,
  useTypedSelector,
} from "../scripts/app/store";
import BaseTable, { AutoResizer } from "react-base-table";
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
import "react-base-table/styles.css";
import "../styles/index.css";
import {
  chatMetaClear,
  receiveNicoChat,
} from "./features/nicoChat/nicoChatSlice";
import { loadAllStorageThunk } from "./features/storageSlice";
import { CommentView, CommentViewItem } from "./components/CommentView";
import { createSelector } from "@reduxjs/toolkit";
import { calcDateToFomat } from "./util/funcs";

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

const IndexComponent = () => {
  const [table, setTable] = useState<BaseTable<CommentViewItem>>();
  const commentViewOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );
  const commentViewItems = useTypedSelector(commentViewItemSelector);

  useEffect(() => {
    if (table == null) return;
  }, [table]);

  useEffect(() => {
    // console.log(`自動スクロール ${chatCount}`);
    if (table == null) return;

    // 自動スクロール
    if (true && commentViewItems.length > 2) {
      table.scrollToRow(commentViewItems.length - 1, "end");
    }
  }, [commentViewItems]);

  const menuWidht = 40;
  const bottomPading = 30;
  return (
    <div className="container">
      <MenuBar />
      <AutoResizer>
        {({ width, height }) => (
          <CommentView
            size={{ width, height: height - (menuWidht + bottomPading) }}
            setRef={setTable}
            option={commentViewOption}
            comments={commentViewItems}
          />
        )}
      </AutoResizer>
    </div>
  );
};

export const commentViewItemSelector = createSelector(
  [
    (state: AppState) => nicoChatSelector(state).user.entities,
    (state: AppState) => nicoChatSelector(state).chat,
    (state: AppState) =>
      nicoLiveSelector(state).schedule?.data?.begin == null
        ? undefined
        : new Date(nicoLiveSelector(state).schedule.data.begin),
    (state: AppState) =>
      storageSelector(state).ncbOptions.commentView.columns.icon.width,
  ],
  (users, chats, begin, iconWidth) => {
    if (begin == null) return [];

    return chats.ids.map((id): CommentViewItem => {
      const chatMeta = chats.entities[id];
      const user = users[chatMeta.userId];
      return {
        nanoId: chatMeta.nanoId,
        no: chatMeta.no,
        // prettier-ignore
        icon: chatMeta.anonymous ? <></>
          : user.iconUrl == null ? <span style={{ width: "100%", paddingBottom: "100%" }} />
          : <img className="column_icon_img" src={user.iconUrl} />,
        name: user.kotehan ?? user.userId,
        time: calcDateToFomat(new Date(chatMeta.date * 1000), begin),
        comment: chatMeta.comment,
        height: user.anonymous ? 20 : iconWidth,
      };
    });
  }
);

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
