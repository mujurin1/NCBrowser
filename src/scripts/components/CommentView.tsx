import { createSelector } from "@reduxjs/toolkit";
import React from "react";
import BaseTable, { Column, ColumnShape, Size } from "react-base-table";
import {
  AppState,
  nicoChatSelector,
  nicoLiveSelector,
  storageSelector,
  useTypedDispatch,
  useTypedSelector,
} from "../app/store";
import { ChatMeta } from "../features/nicoChat/nicoChatTypes";
import { updateCommentView } from "../features/storageSlice";
import { columnKeys } from "../srorage/ncbOptionsType";
import { calcDateToFomat } from "../util/funcs";

/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  /** 一意なID */
  nanoId: string;
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
};

const _CommentView = (props: {
  tableSize: Size;
  setRef: (ref: BaseTable<CommentViewItem>) => void;
}) => {
  const dispatch = useTypedDispatch();
  const commentViewOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );
  const comment = useTypedSelector(commentViewItemsSelector);
  const columnsOp = commentViewOption.columns;

  const columnResize = ({
    column,
    width,
  }: {
    column: ColumnShape<CommentViewItem>;
    width: number;
  }) => {
    const cKey = column.dataKey as typeof columnKeys[number];
    dispatch(
      updateCommentView({
        ...commentViewOption,
        columns: {
          ...columnsOp,
          [cKey]: {
            ...columnsOp[cKey],
            width: width,
          },
        },
      })
    );
  };

  return (
    <BaseTable<CommentViewItem>
      rowKey="nanoId"
      ref={props.setRef}
      data={comment}
      onColumnResize={columnResize}
      estimatedRowHeight={({ rowData, rowIndex }) => {
        return rowData.anonymous ? 20 : columnsOp["iconUrl"].width;
      }}
      width={props.tableSize.width}
      height={props.tableSize.height}
      getScrollbarSize={() => 10}
      // overlayRenderer={<div>HELLO</div>}
      onScroll={({
        scrollLeft,
        scrollTop,
        horizontalScrollDirection,
        verticalScrollDirection,
        scrollUpdateWasRequested,
      }) => {
        // console.log("=====================");
        // console.log(`スクロール位置左から:${scrollLeft}`);
        // console.log(`スクロール位置上から:${scrollTop}`);
        // console.log(`スクロールは左から右に？:${horizontalScrollDirection == "forward"}`);
        // console.log(`スクロールは上から下に？:${verticalScrollDirection == "forward"}`);
        // console.log(`スクロールはユーザーによって？:${!scrollUpdateWasRequested}`);
      }}
    >
      <Column
        flexShrink={0}
        resizable={true}
        className="column_no"
        key={columnKeys[0]}
        dataKey={columnKeys[0]}
        title="コメ番"
        width={columnsOp.no.width}
      />
      <Column<CommentViewItem>
        flexShrink={0}
        resizable={true}
        className="column_icon"
        key={columnKeys[1]}
        dataKey={columnKeys[1]}
        title="アイコン"
        width={columnsOp.iconUrl.width}
        cellRenderer={({ rowData }) => {
          if (rowData.anonymous) return <></>;
          if (rowData.iconUrl != null) return <img src={rowData.iconUrl} />;
          return <span style={{ width: "100%", paddingBottom: "100%" }} />;
        }}
      />
      <Column<CommentViewItem>
        flexShrink={0}
        resizable={true}
        className="column_kotehan"
        key={columnKeys[2]}
        dataKey={columnKeys[2]}
        title="ユーザー名"
        width={columnsOp.kotehan.width}
        cellRenderer={({ rowData }) => (
          <div>{rowData.kotehan ?? rowData.userId}</div>
        )}
      />
      <Column
        flexShrink={0}
        resizable={true}
        className="column_time"
        key={columnKeys[3]}
        dataKey={columnKeys[3]}
        title="時間"
        width={columnsOp.time.width}
      />
      <Column
        flexShrink={1}
        resizable={false}
        flexGrow={1}
        key={columnKeys[4]}
        dataKey={columnKeys[4]}
        title="コメント"
        width={columnsOp.comment.width}
      />
    </BaseTable>
  );
};

export const CommentView = React.memo(_CommentView);

export const commentViewItemsSelector = createSelector(
  [
    (state: AppState) => nicoChatSelector(state).user.entities,
    (state: AppState) => nicoChatSelector(state).chat,
    (state: AppState) =>
      nicoLiveSelector(state).schedule?.data?.begin == null
        ? undefined
        : new Date(nicoLiveSelector(state).schedule.data.begin),
  ],
  (users, chats, begin) => {
    if (begin == null) return [];

    return chats.ids.map((id): CommentViewItem => {
      const chat = chats.entities[id];
      const user = users[chat.userId];
      return {
        nanoId: chat.nanoId,
        no: chat.no,
        iconUrl: user.iconUrl,
        userId: user.userId,
        kotehan: user.kotehan ?? user.userId,
        time: calcDateToFomat(new Date(chat.date * 1000), begin),
        comment: chatGetComment(chat),
        anonymous: user.anonymous,
      };
    });
  }
);

const parser = new DOMParser();
/**
 * 放送者コメントの一部はHTMLタグなので、ちゃんとする\
 * <u><font color="#00CCFF"><a href="URL" target="_blank">lv**</a></font></u>
 * @param chat
 * @returns 表示テキスト
 */
function chatGetComment(chat: ChatMeta): string {
  // prettier-ignore
  if (
    chat.senderType === "Liver" &&
    chat.comment.indexOf(`<`) >= 0
  ) {
    const f = parser.parseFromString(chat.comment, "text/html");
    return f.getElementsByTagName("a")[0].innerText;
  }
  return chat.comment;
}
