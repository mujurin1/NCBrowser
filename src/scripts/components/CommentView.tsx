import { createSelector } from "@reduxjs/toolkit";
import React from "react";
import BaseTable, { Column, Size } from "react-base-table";
import { RootState, useTypedSelector } from "../app/store";
import { calcDateToFomat } from "../util/funcs";

/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  /** コメント番号 */
  no: number;
  /** ユーザーアイコン URL */
  iconUrl: string | undefined;
  /** ユーザーID */
  userId: string;
  /** コテハン */
  kotehan: string;
  /** コメント時間 */
  time: string;
  /** コメント内容 */
  comment: string;
  /** 匿名か */
  anonymous: boolean;
}

const _CommentView = (props: {
  tableSize: Size,
  setRef: (ref: BaseTable<CommentViewItem>) => void;
}) => {
  const comments = useTypedSelector(commentViewItemsSelector);

  return (
    <BaseTable<CommentViewItem>
      rowKey="no"
      ref={props.setRef}
      data={comments}
      estimatedRowHeight={30}
      width={props.tableSize.width}
      height={props.tableSize.height}
      getScrollbarSize={() => 10}
      // overlayRenderer={<div>HELLO</div>}
      onScroll={({ scrollLeft, scrollTop, horizontalScrollDirection, verticalScrollDirection, scrollUpdateWasRequested }) => {
        // .log("=====================");
        // .log(`スクロール位置左から:${scrollLeft}`);
        // .log(`スクロール位置上から:${scrollTop}`);
        // .log(`スクロールは左から右に？:${horizontalScrollDirection == "forward"}`);
        // .log(`スクロールは上から下に？:${verticalScrollDirection == "forward"}`);
        // .log(`スクロールはユーザーによって？:${!scrollUpdateWasRequested}`);
      }}
    >
      <Column flexShrink={0} resizable={true} className="column_no"
        key="no" dataKey="no" title="コメ番" width={65}
      />
      <Column<CommentViewItem> flexShrink={0} resizable={true} className="column_icon"
        key="iconUrl" dataKey="iconUrl"
        title="アイコン" width={50}
        cellRenderer={
          ({ rowData }) =>
            rowData.anonymous ? <></> : <img src={rowData.iconUrl}></img>
        }
      />
      <Column<CommentViewItem> flexShrink={0} resizable={true}
        key="userId" dataKey="userId"
        title="ユーザー名" width={100}
        cellRenderer={({ rowData }) =>
          <div className="not_estimate">{rowData.kotehan ?? rowData.userId}</div>}
      />
      <Column flexShrink={0} resizable={true} className="column_time"
        key="time" dataKey="time" title="時間" width={50}
      />
      <Column flexShrink={1} resizable={false} flexGrow={1}
        key="comment" dataKey="comment" title="コメント" width={400}
      />
    </BaseTable>
  );
}

export const CommentView = React.memo(_CommentView);
// export const CommentView = _CommentView;

export const commentViewItemsSelector = createSelector(
  [
    (state: RootState) => state.nicoUsers.entities,
    (state: RootState) => Object.entries(state.chatData.entities),
    (state: RootState) => state.nicoLive.state === "connect" ? new Date(state.nicoLive.schedule.data.begin) : undefined,
  ],
  (users, chats, begin) => {
    if (begin == null) return [];

    return chats.map(([, chat]) => {
      const user = users[chat.user_id];
      return {
        no: chat.no,
        iconUrl: user.iconUrl,
        userId: user.userId,
        kotehan: user.kotehan ?? user.userId,
        time: calcDateToFomat(new Date(chat.date * 1000), begin),
        comment: chat.content,
        anonymous: user.anonymous,
      }
    });
  }
)
