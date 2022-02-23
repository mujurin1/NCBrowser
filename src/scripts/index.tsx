import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store, useTypedSelector } from '../scripts/app/store';
import BaseTable, { AutoResizer } from 'react-base-table';
import { CommentView, CommentViewItem } from './components/CommentView';
import { commentWsOnOpen, receiveChat, receiveSchedule, receiveStatistics } from './api/nicoLiveApi';
import { addChat, chatAllClear } from './features/chatData/chatDataSlice';
import { MenuBar } from './components/MenuBar';
import { scheduleUpdate, statisticsUpdate } from './features/nicoLive/nicoLiveSlice';

import 'react-base-table/styles.css';
import '../styles/index.css';

commentWsOnOpen.add(() => store.dispatch(chatAllClear()));

receiveChat.add(chat => {
  store.dispatch(addChat(chat));
});
receiveSchedule.add(schedule => {
  store.dispatch(scheduleUpdate(schedule));
});
receiveStatistics.add(statistics => {
  store.dispatch(statisticsUpdate(statistics));
});

const IndexComponent = () => {
  const chatCount = useTypedSelector(state => Object.keys(state.chatData.entities).length);

  let table: BaseTable<CommentViewItem>;
  const setRef = (ref: BaseTable<CommentViewItem>) => table = ref;

  useEffect(() => {
    // 自動スクロール
    if (table == null || chatCount < 2) return;

    if (true)
      table.scrollToRow(chatCount - 1, "end");

  }, [chatCount])

  // receiveChat.add(() => {
  //   // 自動スクロール
  //   if (table == null) return;

  //   if (true) {
  //     table.scrollToRow(chatCount- 1, "end");
  //     setTimeout(() => {
  //     table.scrollToRow(chatCount- 1, "end");
  //     }, 1000);
  //   }
  // });

  const menuWidht = 30;
  const bottomPading = 30;
  return (<div className="container">
    <MenuBar />
    <AutoResizer>
      {({ width, height }) => (
          <CommentView
            tableSize={{ width, height: height - (menuWidht + bottomPading) }}
            setRef={setRef} />
        )
      }
    </AutoResizer>
  </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <IndexComponent />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'));
