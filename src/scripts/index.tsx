import React, { useEffect } from "react";
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
  systemWsOnMessage,
  commentWsOnMessage,
} from "./api/nicoLiveApi";
import { addChat, addChats, chatAllClear } from "./features/chatDataSlice";
import { MenuBar } from "./components/MenuBar";
import { scheduleUpdate, statisticsUpdate } from "./features/nicoLiveSlice";
import { bouyomiTalk } from "./api/bouyomiChanApi";
import "react-base-table/styles.css";
import "../styles/index.css";

commentWsOnOpen.add(() => store.dispatch(chatAllClear()));

// コメントを纏めて取得しおえたら呼ばれる
batchedComments.add((chats) => {
  store.dispatch(addChats(chats));
  // chats.forEach((chat) => {
  //   store.dispatch(addChat(chat));
  // });
});

receiveChat.add((chat) => {
  store.dispatch(addChat(chat));
  const state: RootState = store.getState();
  // 読み上げ
  if (state.ncbOption.bouyomiChanOn) {
    bouyomiTalk(chat.content);
  }
});
receiveSchedule.add((schedule) => {
  store.dispatch(scheduleUpdate(schedule));
});
receiveStatistics.add((statistics) => {
  store.dispatch(statisticsUpdate(statistics));
});

const IndexComponent = () => {
  const chatCount = useTypedSelector(
    (state) => Object.keys(state.chatData.entities).length
  );

  let table: BaseTable<CommentViewItem>;
  const setRef = (ref: BaseTable<CommentViewItem>) => (table = ref);

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

  const menuWidht = 30;
  const bottomPading = 30;
  return (
    <div className="container">
      <MenuBar />
      <AutoResizer>
        {({ width, height }) => (
          <CommentView
            tableSize={{ width, height: height - (menuWidht + bottomPading) }}
            setRef={setRef}
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
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
