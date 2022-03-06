import { useCallback, useEffect, useRef, useState } from "react";

export type ResizableAlignState = {
  /** 各カラムの幅 */
  columnsWidth: number[];
  /** リサイズ中のオブジェクトの一時値 */
  resizeTarget: ResizeTemp;
  /** リサイズを開始する */
  resizeStart: (index: number, startX: number) => void;
  /** リサイズする */
  resizeUpdate: (updateX: number) => void;
  /** リサイズを終了する */
  resizeEnd: (updateX: number) => void;
};
export type ResizeTemp = {
  /** リサイズするカラムのインデックス */
  index: number;
  /** リサイズ開始時のカラムの幅 */
  startWidth: number;
  /** リサイズ開始時のマウス座標X */
  startX: number;
};

export type resizableAlignStateProps = {
  defaultColumnsWidth: number[];
  /** 各カラムの最小幅 0以上 */
  columnsMinWidth: number[];
  /** リサイズが起こった */
  onResize: (
    index: number,
    newItemWidth: number[],
    isResizeEnd: boolean
  ) => void;
  // /** リサイズが終了した */
  // onResizeEnd: (newItemWidth: number[]) => void;
};

export function useResizableAlignState(
  props: resizableAlignStateProps
): ResizableAlignState {
  const [columnsWidth, setColumnsWidth] = useState<number[]>(
    props.defaultColumnsWidth
  );
  const [resizeTarget, setResizeTarget] = useState<ResizeTemp>();

  useEffect(() => {
    setColumnsWidth(props.defaultColumnsWidth);
    setResizeTarget(undefined);
  }, [props.defaultColumnsWidth]);

  /** 最小幅を考慮したサイズ変更関数 */
  const updateSize = useCallback(
    (newWidth: number, end: boolean) => {
      const index = resizeTarget.index;
      if (newWidth > props.columnsMinWidth[index]) {
        setColumnsWidth((oldValue) => {
          const newValue = [...oldValue];
          newValue[index] = newWidth;
          props.onResize(index, newValue, end);
          return newValue;
        });
      }
    },
    [resizeTarget, setColumnsWidth, props.onResize, props.columnsMinWidth]
  );

  const resizeStart = useCallback(
    (index: number, startX: number) => {
      setResizeTarget({ index, startX, startWidth: columnsWidth[index] });
    },
    [setResizeTarget, columnsWidth]
  );

  const resizeUpdate = useCallback(
    (updateX: number) => {
      if (resizeTarget == null) return;
      updateSize(
        resizeTarget.startWidth + (updateX - resizeTarget.startX),
        false
      );
    },
    [updateSize, resizeTarget]
  );

  const resizeEnd = useCallback(
    (updateX: number) => {
      if (resizeTarget == null) return;
      updateSize(
        resizeTarget.startWidth + (updateX - resizeTarget.startX),
        true
      );
      setResizeTarget(undefined);
    },
    [updateSize, resizeTarget, setResizeTarget]
  );

  return { columnsWidth, resizeTarget, resizeStart, resizeUpdate, resizeEnd };
}
