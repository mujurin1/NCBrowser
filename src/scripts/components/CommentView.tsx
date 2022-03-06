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

const headerHeight = 30;
const minWidth = [40, 10, 60, 30, 50];

export function CommentView(props: CommentViewProps) {
  const dispatch = useTypedDispatch();
  const listRef = useRef<VariableSizeList<CommentViewItem[]>>();
  const itemData = useTypedSelector(commentViewItemSelector);
  const option = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );
  const itemWidth = React.useMemo(
    () => columnKeys.map((key) => option.columns[key].width),
    [option]
  );

  const [rowHeightMap, setRowHeightMap] = useState<Record<number, number>>({});
  const [columnWidthMap, setColumnWidthMap] = useState<ColumnsStorage>();

  useEffect(() => {
    setColumnWidthMap(option.columns);
  }, [option.columns]);

  const setHeight = (index: number, height: number) => {
    if (rowHeightMap[index] === height) return;
    setRowHeightMap((oldHeightMap) => {
      return { ...oldHeightMap, [index]: height };
    });
    listRef.current.resetAfterIndex(index);
  };

  const onResize = useCallback(
    (index: number, width: number, resized: boolean) => {
      setColumnWidthMap((oldColumnWidthMap) => {
        return { ...oldColumnWidthMap, [columnKeys[index]]: { width: width } };
      });
      if (resized) dispatch(resizeHeader([columnKeys[index], width]));
    },
    [columnKeys, dispatch, setColumnWidthMap]
  );

  const getSize = (index: number) =>
    rowHeightMap[index] ?? option.columns.icon.width;

  const header = React.useMemo(
    () => (
      <ResizableAlign
        onResize={onResize}
        itemWidth={itemWidth}
        height={30}
        minWidth={minWidth}
        style={{ position: "sticky", top: 0 }}
      >
        {columnKeys.map((key) => (
          <div key={key} className="comment-view-header-item">
            {columnNames[key]}
          </div>
        ))}
      </ResizableAlign>
    ),
    [itemWidth, minWidth, columnKeys, columnNames, onResize]
  );

  return (
    <div className="comment-view">
      <VariableSizeListWithHeader
        _ref={listRef}
        className="comment-view-table"
        itemCount={itemData.length}
        width={props.width}
        height={props.height - headerHeight}
        itemSize={getSize}
        itemData={itemData}
        headerHeight={headerHeight}
        header={header}
      >
        {(arg) => (
          <RowView
            index={arg.index}
            item={arg.data[arg.index]}
            setHeight={setHeight}
            style={{ ...arg.style, transform: `translateY(${headerHeight}px)` }}
            itemWidth={columnWidthMap}
          />
        )}
      </VariableSizeListWithHeader>
    </div>
  );
  return (
    <div className="comment-view">
      <VariableSizeList<CommentViewItem[]>
        ref={listRef}
        className="comment-view-table"
        itemCount={itemData.length}
        width={props.width}
        height={props.height - headerHeight}
        itemSize={getSize}
        itemData={itemData}
        innerElementType={(props: { children: any }) => {
          return (
            <>
              <ResizableAlign
                onResize={onResize}
                itemWidth={itemWidth}
                height={30}
                minWidth={minWidth}
                style={{ position: "sticky", top: 0 }}
              >
                {columnKeys.map((key) => (
                  <div key={key} className="comment-view-header-item">
                    {columnNames[key]}
                  </div>
                ))}
              </ResizableAlign>
              {props.children}
            </>
          );
        }}
      >
        {(arg) => (
          <RowView
            index={arg.index}
            item={arg.data[arg.index]}
            setHeight={setHeight}
            style={{ ...arg.style, transform: `translateY(${headerHeight}px)` }}
            itemWidth={columnWidthMap}
          />
        )}
      </VariableSizeList>
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
  itemWidth: ColumnsStorage;
  setHeight: (index: number, height: number) => void;
  style: React.CSSProperties;
}) {
  const rowRef = useRef<HTMLDivElement>();
  const index = props.index;

  React.useLayoutEffect(() => {
    const width = rowRef.current.clientHeight;
    if (
      props.item["icon"] == undefined ||
      props.itemWidth["icon"].width <= width
    )
      props.setHeight(index, rowRef.current.clientHeight);
  }, [props.setHeight, props.item]);

  return (
    <div
      ref={rowRef}
      style={{ ...props.style, height: "auto" }}
      className="comment-view-row"
      key={props.item.nanoId}
    >
      {columnKeys.map((key) => (
        <div
          key={key}
          style={{
            width: props.itemWidth[key].width,
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
