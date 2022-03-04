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
import {
  columnKeys,
  ColumnKeysType,
  columnNames,
  ColumnsStorage,
  ColumnStorage,
  CommentViewStorage,
} from "../srorage/ncbOptionsType";
import { calcDateToFomat } from "../util/funcs";

import "../../styles/comment-view.css";
import { defaultIconUrl } from "../util/nico";

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
  const listRef = useRef<VariableSizeList<CommentViewItem[]>>();
  const itemData = useTypedSelector(commentViewItemSelector);
  const option = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.commentView
  );
  const [heightMap, setHeightMap] = useState<Record<number, number>>({});

  const setHeight = (index: number, height: number) => {
    if (heightMap[index] === height) return;
    setHeightMap((oldHeightMap) => {
      return { ...oldHeightMap, [index]: height };
    });
    listRef.current.resetAfterIndex(index);
  };
  const getSize = (index: number) =>
    heightMap[index] ?? option.columns.icon.width;

  const headerWidth = 30;

  return (
    <div className="comment-view">
      <HeaderView columnsOption={option.columns} />
      <VariableSizeList<CommentViewItem[]>
        ref={listRef}
        itemCount={itemData.length}
        width={props.width}
        height={props.height - headerWidth}
        itemSize={getSize}
        itemData={itemData}
      >
        {(arg) => (
          <RowView
            index={arg.index}
            item={arg.data[arg.index]}
            setHeight={setHeight}
            style={arg.style}
            columnsOption={option.columns}
          />
        )}
      </VariableSizeList>
    </div>
  );
}

function HeaderView(props: { columnsOption: ColumnsStorage }) {
  // const resizeTargetRef = useRef<HTMLElement>();
  const [resizeTarget, setResizeTarget] = useState<{
    key: ColumnKeysType;
    width: number;
    target: HTMLElement;
  }>();

  function resizeMouseDown(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    key: ColumnKeysType
  ) {
    const target = e.currentTarget.parentElement;

    setResizeTarget({ key, width: target.clientWidth, target });
  }
  function resizeMouseMove(e: MouseEvent) {
    if (resizeTarget == null) return;
    setResizeTarget((oldResizeTarget) => {
      const newResizeTarget = { ...oldResizeTarget };
      newResizeTarget.width += e.movementX;
      if (newResizeTarget.width < 10) newResizeTarget.width = 10;
      console.log(newResizeTarget.width);

      newResizeTarget.target.style.width = `${newResizeTarget.width}px`;
      return newResizeTarget;
    });
    // resizeTarget[1].style.width
    // console.log(` ${e.clientX}, ${e.movementX}`);
  }
  function resizeMouseUp(e: MouseEvent) {
    if (resizeTarget == null) return;
    setResizeTarget(undefined);
  }

  useLayoutEffect(() => {
    window.addEventListener("mousemove", resizeMouseMove);
    window.addEventListener("mouseup", resizeMouseUp);
    return () => {
      window.removeEventListener("mousemove", resizeMouseMove);
      window.removeEventListener("mouseup", resizeMouseUp);
    };
  }, [resizeTarget]);

  return (
    <div className="comment-view-header">
      {columnKeys.map((key) => (
        <div
          key={key}
          style={{
            width: props.columnsOption[key].width,
          }}
          className={`comment-view-header-${key}`}
        >
          {columnNames[key]}
          {key === "comment" ? (
            <></>
          ) : (
            <div
              className="comment-view-header-resizer"
              onMouseDown={(e) => resizeMouseDown(e, key)}
            />
          )}
        </div>
      ))}
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
  setHeight: (index: number, height: number) => void;
  style: React.CSSProperties;
  columnsOption: ColumnsStorage;
}) {
  const rowRef = useRef<HTMLDivElement>();

  React.useLayoutEffect(() => {
    const width = rowRef.current.clientHeight;
    if (
      props.item["icon"] == undefined ||
      props.columnsOption.icon.width <= width
    )
      props.setHeight(props.index, rowRef.current.clientHeight);
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
            width: props.columnsOption[key].width,
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
