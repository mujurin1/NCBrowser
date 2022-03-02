import React from "react";
import BaseTable, { Size, Column } from "react-base-table";
import { columnKeys, CommentViewStorage } from "../srorage/ncbOptionsType";

/**
 * CommentViewに表示する情報
 */
export type CommentViewItem = {
  /** 一意なID */
  nanoId: string;
  /** コメント番号 */
  no: number;
  /** ユーザーアイコン */
  icon: JSX.Element;
  /** コテハン */
  name: string;
  /** コメント時間 */
  time: string;
  /** コメント内容 */
  comment: string;
  /** 行の高さ */
  height: number;
};

export type CommentViewProps = {
  /** コメントビュー全体のサイズ */
  size: Size;
  /** コメントビューのオプション */
  option: CommentViewStorage;
  // /** ヘッダーの高さ */
  // headerWidth: number;
  // /** カラムの幅 [コメ番,アイコン,ユーザー名,時間] */
  // columnWidth: readonly [number, number, number, number];
  /** 表示するコメント */
  comments: CommentViewItem[];
  /** テーブルの参照をセットする */
  setRef?: (ref: BaseTable<CommentViewItem>) => void;
  /** カラム幅変更イベント */
  onColumnResize?: (columnKey: string, width: number) => void;
  /** スクロールイベント */
  onScroll?: () => void;
};

const _CommentView = (props: CommentViewProps) => (
  <BaseTable<CommentViewItem>
    rowKey="nanoId"
    ref={props.setRef}
    data={props.comments}
    onColumnResize={({ column, width }) => {
      props.onColumnResize(column.dataKey, width);
    }}
    estimatedRowHeight={({ rowData }) => rowData.height}
    width={props.size.width}
    height={props.size.height}
    getScrollbarSize={() => 10}
    // overlayRenderer={<div>HELLO</div>}
    // onScroll={() => {}}
  >
    <Column
      title="コメ番"
      className="column_no"
      key={columnKeys[0]}
      dataKey={columnKeys[0]}
      width={props.option.columns.no.width}
      flexShrink={0}
      resizable={true}
    />
    <Column<CommentViewItem>
      title="アイコン"
      className="column_icon"
      key={columnKeys[1]}
      dataKey={columnKeys[1]}
      width={props.option.columns.icon.width}
      flexShrink={0}
      resizable={true}
    />
    <Column<CommentViewItem>
      title="ユーザー名"
      className="column_name"
      key={columnKeys[2]}
      dataKey={columnKeys[2]}
      width={props.option.columns.name.width}
      flexShrink={0}
      resizable={true}
    />
    <Column
      title="時間"
      className="column_time"
      key={columnKeys[3]}
      dataKey={columnKeys[3]}
      width={props.option.columns.time.width}
      flexShrink={0}
      resizable={true}
    />
    <Column
      title="コメント"
      // className="column_comment"
      key={columnKeys[4]}
      dataKey={columnKeys[4]}
      width={props.option.columns.comment.width}
      flexShrink={1}
      resizable={false}
      flexGrow={1}
    />
  </BaseTable>
);

/**
 * コメントビュー（メモ化されている）
 */
export const CommentView = React.memo(_CommentView);
