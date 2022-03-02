import React, { useLayoutEffect, useState } from "react";

export type Size = {
  width: number;
  height: number;
};

export function Resizer({ children }: { children: (size: Size) => void }) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return <>{children(size)}</>;
}
