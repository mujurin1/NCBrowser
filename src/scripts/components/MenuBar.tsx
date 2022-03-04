import { LoadingButton } from "@mui/lab";
import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { BrowserSpeechAPI } from "../api/browserSpeechApi";
import {
  nicoLiveSelector,
  storageSelector,
  useTypedDispatch,
  useTypedSelector,
} from "../app/store";
import { changeLive } from "../features/nicoLiveSlice";
import { loadAllStorageThunk, switchSpeech } from "../features/storageSlice";

import "../../styles/menu-bar.css";

export const MenuBar = (props: { className?: string }) => {
  const dispatch = useTypedDispatch();
  const loading =
    useTypedSelector((state) => nicoLiveSelector(state).state) === "waiting";
  const [liveId, setLiveId] = useState("co3860320");
  const nicoLiveState = useTypedSelector(
    (state) => nicoLiveSelector(state).state
  );
  const yomiage = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.yomiage
  );

  const connect = () => {
    let idIndex: number;
    for (const prefix of ["lv", "co", "ch"]) {
      idIndex = liveId.indexOf(prefix);
      if (idIndex >= 0) break;
    }
    if (idIndex === -1) return;

    const id = liveId.substring(idIndex);
    dispatch(changeLive(id));
  };

  const disconnect = () => {
    if (nicoLiveState === "connect") dispatch(changeLive(""));
  };

  return (
    <FormGroup
      sx={{ padding: "4px", flexWrap: "nowrap", height: "40px" }}
      className={`menu-bar ${props.className}`}
      row={true}
    >
      <TextField
        size="small"
        itemType="text"
        value={liveId}
        onChange={(e) => setLiveId(e.target.value)}
      />
      &ensp;
      <LoadingButton
        onClick={connect}
        variant="contained"
        size="small"
        color="success"
        loading={loading}
        loadingIndicator="接続中..."
      >
        接続
      </LoadingButton>
      <LoadingButton
        onClick={disconnect}
        variant="contained"
        size="small"
        color="warning"
        loading={loading}
        loadingIndicator="接続中..."
      >
        切断
      </LoadingButton>
      <FormGroup>
        <FormControlLabel
          sx={{ paddingRight: 1 }}
          labelPlacement="start"
          label="読み上げ"
          control={
            <Switch
              checked={yomiage.on}
              onChange={() => {
                if (yomiage.on && yomiage.useSpeechApi === "ブラウザ読み上げ") {
                  BrowserSpeechAPI.reset();
                }
                dispatch(switchSpeech(!yomiage.on));
              }}
            />
          }
        />
      </FormGroup>
      &ensp;
      <Button
        variant="contained"
        onClick={() => dispatch(loadAllStorageThunk())}
      >
        設定の反映
      </Button>
      <Button
        variant="contained"
        color="inherit"
        onClick={() => window.open("options.html", "options")}
      >
        設定
      </Button>
    </FormGroup>
  );
};
