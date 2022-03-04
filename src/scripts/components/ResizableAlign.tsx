import React, { useEffect, useLayoutEffect, useState } from "react";

import "./resizable-align.css";

export function ResizableAlign(props: {
  onResize: (index: number, width: number, resized: boolean) => void;
  children: React.ReactElement[];
  height: number;
  itemWidth: number[];
  minWidth?: number[];
}) {
  const [itemWidth, setItemWidth] = useState<number[]>(props.itemWidth);
  const [resizeTarget, setResizeTarget] = useState<{
    index: number;
    target: HTMLElement;
    width: number;
    targetX: number;
  }>();

  useEffect(() => {
    setItemWidth(props.itemWidth);
  }, props.itemWidth);

  let childElement: React.ReactElement[] = [];

  function onMouseDown(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) {
    const target = e.currentTarget.parentElement;

    setResizeTarget({
      index,
      target,
      width: target.clientWidth,
      targetX: target.offsetLeft,
    });
  }
  function onMouseMove(e: MouseEvent) {
    if (resizeTarget == null) return;
    const newResizeTarget = { ...resizeTarget };

    const index = newResizeTarget.index;
    const min = props.minWidth?.[index] ?? 1;
    // 最小幅チェック
    let width = e.clientX - newResizeTarget.targetX;
    if (width < min) width = min;
    newResizeTarget.width = width;

    // 更新
    setResizeTarget(newResizeTarget);
    setItemWidth((oldItemWidth) => {
      const newItemWidth = [...oldItemWidth];
      newItemWidth[index] = newResizeTarget.width;
      return newItemWidth;
    });
    props.onResize(newResizeTarget.index, width, false);
  }
  function onMouseUp(e: MouseEvent) {
    if (resizeTarget == null) return;
    props.onResize(resizeTarget.index, resizeTarget.width, true);

    setResizeTarget(undefined);
  }

  useLayoutEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizeTarget]);

  const resizeCount = props.children.length - 1;
  for (let i = 0; i < resizeCount; i++) {
    const child = props.children[i];
    childElement.push(
      <div
        key={i}
        className={`resizable-align-item`}
        style={{ width: itemWidth[i] + 3, minWidth: props.minWidth?.[i] }}
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
        width: itemWidth[resizeCount] + 3,
        minWidth: props.minWidth?.[resizeCount],
      }} //
    >
      {props.children[resizeCount]}
    </div>
  );

  return (
    <div className="resizable-align" style={{ height: props.height }}>
      {childElement}
    </div>
  );
}
