import React from "react";
import { useTypedDispatch, useTypedSelector } from "../../app/store";

export function General() {
  const dispatch = useTypedDispatch();
  const ncbOption = useTypedSelector((state) => state.ncbOption);

  return <div className="container">無し</div>;
}
