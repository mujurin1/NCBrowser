import React, { useCallback, useLayoutEffect } from "react";

import "./resizable-align.css";
import { ResizableAlignState } from "./useResizableAlignState";

export type ResizableAlignProps = {
  className: string;
  resizableAlignState: ResizableAlignState;
  // onResize: (index: number, newItemWidth: number[]) => void;
  // onResizeEnd: () => void;
  children: React.ReactElement[];
  height: number;
  itemWidth: number[];
  minWidth: number[];
  style: React.CSSProperties;
};

export function ResizableAlign(props: ResizableAlignProps) {
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
      props.resizableAlignState.resizeStart(index, e.clientX);
    },
    [props.resizableAlignState.resizeStart]
  );
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      props.resizableAlignState.resizeUpdate(e.clientX);
    },
    [props.resizableAlignState.resizeUpdate]
  );
  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      props.resizableAlignState.resizeEnd(e.clientX);
    },
    [props.resizableAlignState.resizeEnd]
  );

  let childElement: React.ReactElement[] = [];

  useLayoutEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const resizeCount = props.children.length - 1;
  for (let i = 0; i < resizeCount; i++) {
    const child = props.children[i];
    childElement.push(
      <div
        key={i}
        className={`resizable-align-item`}
        style={{
          width: props.resizableAlignState.columnsWidth[i],
          minWidth: props.minWidth[i],
        }}
      >
        {child}
        <div
          className="resizable-align-resizer"
          onMouseDown={(e) => onMouseDown(e, i)}
        />
      </div>
    );
  }
  childElement.push(
    <div
      key={-1}
      className="resizable-align-item resizable-align-end"
      style={{
        width: props.resizableAlignState.columnsWidth[resizeCount],
      }}
    >
      {props.children[resizeCount]}
    </div>
  );

  return (
    <div
      className={`resizable-align ${props.className}`}
      style={{ ...props.style, height: props.height }}
    >
      {childElement}
    </div>
  );
}
