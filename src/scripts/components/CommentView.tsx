import { createSelector } from "@reduxjs/toolkit";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { VariableSizeList } from "react-window";
import {
  AppState,
  nicoChatSelector,
  nicoLiveSelector,
  storageSelector,
  useTypedDispatch,
  useTypedSelector,
} from "../app/store";
import {
  columnKeys,
  columnNames,
  ColumnsStorage,
} from "../srorage/ncbOptionsType";
import { calcDateToFomat } from "../util/funcs";

import "../../styles/comment-view.css";
import { defaultIconUrl } from "../util/nico";
import { ResizableAlign, ResizableAlignProps } from "./ResizableAlign";
import { resizeHeader } from "../features/storageSlice";
import { VariableSizeListWithHeader } from "./VariableSizeListWithHeader";
import { useResizableAlignState } from "./useResizableAlignState";
import zIndex from "@mui/material/styles/zIndex";

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
  /** ヘッダーの縦幅 */
  headerHeight: number;
};

// const headerHeight = 30;
const columnsMinWidth = [40, 10, 60, 30, 50];

export function CommentView(props: CommentViewProps) {
  const dispatch = useTypedDispatch();
  const option = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );
  // 各カラムの幅
  const columnsWidth = React.useMemo(
    () => columnKeys.map((key) => option.columns[key].width),
    [option]
  );

  const onResize = useCallback(
    (index: number, newItemWidth: number[], isResizeEnd: boolean) => {
      if (isResizeEnd)
        dispatch(resizeHeader([columnKeys[index], newItemWidth[index]]));
    },
    [columnKeys, dispatch]
  );
  // const onResized = useCallback(
  //   () => {
  //     dispatch(resizeHeader([columnKeys[index], width]));
  //   },
  //   [columnKeys, dispatch]
  // );

  // サイズ変更ビューの状態
  const resizableState = useResizableAlignState({
    defaultColumnsWidth: columnsWidth,
    columnsMinWidth: columnsMinWidth,
    onResize: onResize,
  });

  // リストビューへの参照
  const listRef = useRef<VariableSizeList<CommentViewItem[]>>();
  // ビューに表示するアイテム
  const itemData = useTypedSelector(commentViewItemSelector);

  // 各ビューアイテムの高さ
  const [itemHeightMap, setItemHeightMap] = useState<Record<number, number>>(
    {}
  );

  const setItemHeight = (index: number, height: number) => {
    if (itemHeightMap[index] === height) return;
    setItemHeightMap((oldHeightMap) => {
      return { ...oldHeightMap, [index]: height };
    });
    listRef.current.resetAfterIndex(index);
  };

  const getItemHeight = (index: number) =>
    itemHeightMap[index] ?? option.columns.icon.width;

  const header = React.useMemo(
    () => (
      <ResizableAlign
        className="comment-view-header"
        resizableAlignState={resizableState}
        itemWidth={columnsWidth}
        height={30}
        minWidth={columnsMinWidth}
        style={{ position: "sticky", top: 0, zIndex: 2 }}
      >
        {columnKeys.map((key) => (
          <div key={key} className="comment-view-header-item">
            {columnNames[key]}
          </div>
        ))}
      </ResizableAlign>
    ),
    [columnsWidth, columnsMinWidth, columnKeys, columnNames, resizableState]
  );

  return (
    <div className="comment-view">
      <VariableSizeListWithHeader
        _ref={listRef}
        className="comment-view-table"
        itemCount={itemData.length}
        width={props.width}
        height={props.height - props.headerHeight}
        itemSize={getItemHeight}
        itemData={itemData}
        headerHeight={props.headerHeight}
        header={header}
      >
        {(arg) => (
          <RowView
            index={arg.index}
            item={arg.data[arg.index]}
            setHeight={setItemHeight}
            style={{
              ...arg.style,
              transform: `translateY(${props.headerHeight}px)`,
            }}
            columnsWidth={resizableState.columnsWidth}
          />
        )}
      </VariableSizeListWithHeader>
    </div>
  );
}

/**
 * コメントビューアの行コンポーネント
 * @param props
 * @returns
 */
function RowView(props: {
  item: CommentViewItem;
  index: number;
  columnsWidth: number[];
  setHeight: (index: number, height: number) => void;
  style: React.CSSProperties;
}) {
  const rowRef = useRef<HTMLDivElement>();
  const index = props.index;

  React.useLayoutEffect(() => {
    const width = rowRef.current.clientHeight;
    if (props.item["icon"] == undefined || props.columnsWidth[1] <= width)
      props.setHeight(index, rowRef.current.clientHeight);
  }, [props.setHeight, props.item]);

  return (
    <div
      ref={rowRef}
      style={{ ...props.style, height: "auto" }}
      className="comment-view-row"
      key={props.item.nanoId}
    >
      {columnKeys.map((key, i) => (
        <div
          key={key}
          style={{
            width: props.columnsWidth[i],
            // width: props.columnsOption[key].width,
          }}
          className={`comment-view-row-${key}`}
        >
          {props.item[key]}
        </div>
      ))}
    </div>
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
          : user.iconUrl == null ? <img src={defaultIconUrl} />
          : <img src={user.iconUrl} />,
        name: user.kotehan ?? user.userId,
        time: calcDateToFomat(new Date(chatMeta.date * 1000), begin),
        comment: chatMeta.comment,
      };
    });
  }
);
