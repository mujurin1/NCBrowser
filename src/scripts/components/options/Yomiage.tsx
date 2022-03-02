import React from "react";
import {
  storageSelector,
  useTypedDispatch,
  useTypedSelector,
} from "../../app/store";
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { speechApis } from "../../srorage/ncbOptionsType";
import { changeSpeechApi, switchSpeech } from "../../features/storageSlice";

export function Yomiage() {
  const dispatch = useTypedDispatch();
  const ncbOption = useTypedSelector(
    (state) => storageSelector(state).ncbOptions
  );

  const sxProp = { m: 1, minWidth: 120 };

  return (
    <div className="container">
      <FormGroup>
        <FormControlLabel
          sx={sxProp}
          control={
            <Switch
              checked={ncbOption.yomiage.on}
              onChange={() => dispatch(switchSpeech(!ncbOption.yomiage.on))}
            />
          }
          label="読み上げ"
        />
        <FormControl sx={sxProp}>
          <InputLabel id="yomiage-label">読み上げAPI</InputLabel>
          <Select
            value={ncbOption.yomiage.useSpeechApi}
            onChange={(e) => dispatch(changeSpeechApi(e.target.value as any))}
            inputProps={{ "aria-label": "Without label" }}
            labelId="yomiage-label"
            label="読み上げAPI"
          >
            {speechApis.map((api) => (
              <MenuItem key={api} value={api}>
                {api}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FormGroup>
    </div>
  );
}
