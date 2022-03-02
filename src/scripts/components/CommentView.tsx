import { createSelector } from "@reduxjs/toolkit";
import React, { useContext, useState } from "react";
import { GridChildComponentProps, VariableSizeGrid } from "react-window";
import {
  AppState,
  nicoChatSelector,
  nicoLiveSelector,
  storageSelector,
  useTypedSelector,
} from "../app/store";
import { columnKeys, CommentViewStorage } from "../srorage/ncbOptionsType";
import { calcDateToFomat } from "../util/funcs";

/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  /** 一意なID */
  nanoId: string;
  /** コメント番号 */
  no: number;
  /** ユーザーアイコンURL */
  icon: JSX.Element;
  /** ユーザー名 */
  name: string;
  /** コメント時間 */
  time: string;
  /** コメント内容 */
  comment: string;
};

export type CommentViewProps = {
  /** コメントビューの横幅 */
  width: number;
  /** コメントビューの縦幅 */
  height: number;
};

export function CommentView(props: CommentViewProps) {
  const itemData = useTypedSelector(commentViewItemSelector);
  const commentViewOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );

  return (
    <VariableSizeGrid<CommentViewItem[]>
      width={props.width}
      height={props.height}
      columnCount={5}
      columnWidth={(index) =>
        commentViewOption.columns[columnKeys[index]].width
      }
      rowCount={itemData.length}
      rowHeight={(index) => {
        return itemData[index].icon == null
          ? 20
          : commentViewOption.columns.icon.width;
      }}
      itemData={itemData}
    >
      {(arg) => {
        const item = arg.data[arg.rowIndex];
        const key = columnKeys[arg.columnIndex];
        return (
          <div className={`column-${key}`} style={arg.style}>
            {item[key]}
          </div>
        );
      }}
    </VariableSizeGrid>
  );
}

const commentViewItemSelector = createSelector(
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
  (users, chats, begin) => {
    if (begin == null) return [];

    return chats.ids.map((id): CommentViewItem => {
      const chatMeta = chats.entities[id];
      const user = users[chatMeta.userId];
      return {
        nanoId: chatMeta.nanoId,
        no: chatMeta.no,
        // prettier-ignore
        icon: chatMeta.anonymous ? undefined
          : user.iconUrl == null ? <span style={{ width: "100%", paddingBottom: "100%" }} />
          : <img className="column-icon-img" src={user.iconUrl} />,
        name: user.kotehan ?? user.userId,
        time: calcDateToFomat(new Date(chatMeta.date * 1000), begin),
        comment: chatMeta.comment,
      };
    });
  }
);
