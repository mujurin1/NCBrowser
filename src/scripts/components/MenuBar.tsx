import { LoadingButton } from "@mui/lab";
import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import {
  nicoLiveSelector,
  storageSelector,
  useTypedDispatch,
  useTypedSelector,
} from "../app/store";
import { changeLive } from "../features/nicoLiveSlice";
import { loadAllStorageThunk, switchSpeech } from "../features/storageSlice";

export const MenuBar = () => {
  const dispatch = useTypedDispatch();
  const onSpeech = useTypedSelector(
    (state) => storageSelector(state).ncbOptions.yomiage.on
  );
  const loading =
    useTypedSelector((state) => nicoLiveSelector(state).state) === "waiting";

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
  };

  const disconnect = () => {
    dispatch(changeLive(""));
  };

  return (
    <FormGroup className="menu-bar" sx={{ padding: "4px" }} row={true}>
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
      &ensp;
      <Button
        variant="contained"
        onClick={() => dispatch(loadAllStorageThunk())}
      >
        設定の反映
      </Button>
      <FormGroup>
        <FormControlLabel
          labelPlacement="start"
          label="読み上げ"
          control={
            <Switch
              checked={onSpeech}
              onChange={() => dispatch(switchSpeech(!onSpeech))}
            />
          }
        />
      </FormGroup>
    </FormGroup>
  );
};
