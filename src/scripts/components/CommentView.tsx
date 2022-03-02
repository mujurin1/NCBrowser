import { width } from "@mui/system";
import { createSelector } from "@reduxjs/toolkit";
import { iteratorSymbol } from "immer/dist/internal";
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import {
  GridChildComponentProps,
  VariableSizeGrid,
  VariableSizeList,
} from "react-window";
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
  className?: string;
};

function RowView(props: {
  item: CommentViewItem;
  index: number;
  setHeight: (index: number, height: number) => void;
  style: React.CSSProperties;
}) {
  const columnsOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView.columns
  );
  const rowRef = useRef<HTMLDivElement>();

  React.useEffect(() => {
    props.setHeight(props.index, rowRef.current.getBoundingClientRect().height);
  }, [props.index, props.setHeight]);

  return (
    <div
      ref={rowRef}
      style={{ ...props.style, height: "auto" }}
      className="row"
      key={props.item.nanoId}
    >
      {columnKeys.map((key) => (
        <div
          key={key}
          style={{
            width: columnsOption[key].width,
            minWidth: columnsOption[key].width,
          }}
          className={`column-${key}`}
        >
          {props.item[key]}
        </div>
      ))}
    </div>
  );
}

export function CommentView(props: CommentViewProps) {
  const listRef = useRef<VariableSizeList<CommentViewItem[]>>();
  const [heightMap, setHeightMap] = useState<Record<number, number>>({});

  const setHeight = (index: number, height: number) => {
    if (heightMap[index] === height) return;
    setHeightMap((oldHeightMap) => {
      return { ...oldHeightMap, [index]: height };
    });
    listRef.current.resetAfterIndex(index);
  };
  const getSize = (index: number) =>
    heightMap[index] ??
    (itemData[index].icon == null ? 20 : commentViewOption.columns.icon.width);

  const itemData = useTypedSelector(commentViewItemSelector);
  const commentViewOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );

  return (
    <VariableSizeList<CommentViewItem[]>
      ref={listRef}
      itemCount={itemData.length}
      className={props.className}
      width={props.width}
      height={props.height}
      itemSize={getSize}
      itemData={itemData}
    >
      {(arg) => (
        <RowView
          index={arg.index}
          item={arg.data[arg.index]}
          setHeight={setHeight}
          style={arg.style}
        />
      )}
    </VariableSizeList>
  );

  // return (
  //   <VariableSizeGrid<CommentViewItem[]>
  //     ref={gridRef}
  //     width={props.width}
  //     height={props.height}
  //     columnCount={5}
  //     columnWidth={(index) =>
  //       commentViewOption.columns[columnKeys[index]].width
  //     }
  //     rowCount={itemData.length}
  //     rowHeight={getRowHeight}
  //     itemData={itemData}
  //   >
  //     {(arg) => {
  //       const item = arg.data[arg.rowIndex];
  //       return (
  //         <Cell
  //           item={item}
  //           rowIndex={arg.rowIndex}
  //           columnIndex={arg.columnIndex}
  //           style={arg.style}
  //           setRowHeight={setRowHeight}
  //         />
  //       );
  //     }}
  //   </VariableSizeGrid>
  // );
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
