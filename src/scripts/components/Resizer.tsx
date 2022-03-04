import React, { useLayoutEffect, useRef, useState } from "react";

export type Size = {
  width: number;
  height: number;
};

export function Resizer(props: {
  children: (size: Size) => JSX.Element;
  className?: string;
}) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const divRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    function updateSize() {
      // setSize({ width: window.innerWidth, height: window.innerHeight });
      setSize({
        width: divRef.current.clientWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div ref={divRef} className={props.className}>
      {props.children(size)}
    </div>
  );
}
