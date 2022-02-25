import React, { useState } from "react"
import { useSelector } from "react-redux";
import { useTypedDispatch, useTypedSelector } from "../app/store";
import { bouyomiChanSwitch } from "../features/ncbOptionSlice";
import { changeLive } from "../features/nicoLiveSlice";

export const MenuBar = () => {
  const dispatch = useTypedDispatch();
  const info = useTypedSelector(state => state.nicoLive.systemInfo);
  const onSpeech = useTypedSelector(state => state.ncbOption.bouyomiChanOn);

  const [liveId, setLiveId] = useState("co3860320");

  const connect = () => {
    let idIndex = liveId.indexOf("lv");
    if (idIndex < 0) {
      idIndex = liveId.indexOf("co");
      if (idIndex < 0) {
        return;
      }
    }
    const id = liveId.substring(idIndex);
    dispatch(changeLive(id));
  }

  const disconnect = () => {
    dispatch(changeLive(""));
  }

  return (<>
    <div className="menu" >
      <input type="text" id="inputLiveUrl" size={15} value={liveId} onChange={e => setLiveId(e.target.value)} />
      &ensp;
      <button type="submit" id="connectBtn" onClick={connect}>接続</button>
      <button type="submit" id="disconnectBtn" onClick={disconnect}>切断</button>
      &ensp;
      <button onClick={() => dispatch(bouyomiChanSwitch())}>読み上げ{onSpeech ? "ON" : "OFF"}</button>
      <span>{info[0]}</span>
    </div>
  </>)
}