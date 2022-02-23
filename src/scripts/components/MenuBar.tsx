import React, { useState } from "react"
import { useTypedDispatch } from "../app/store";
import { changeLive } from "../features/nicoLive/nicoLiveSlice";

export const MenuBar = () => {
  const [liveId, setLiveId] = useState("co3860320");
  const dispatch = useTypedDispatch();

  const connect = () => {
    let idIndex = liveId.indexOf("lv");
    if(idIndex < 0) {
      idIndex = liveId.indexOf("co");
      if(idIndex < 0) {
        return
      }
    }
    const id = liveId.substring(idIndex);
    dispatch(changeLive(id));
  }

  return (<>
    <div className="menu" >
      <input type="text" id="inputLiveUrl" size={60} value={liveId} onChange={e => setLiveId(e.target.value)} />
      <button type="submit" id="connectBtn" onClick={connect}>接続</button>
    </div>
  </>)
}