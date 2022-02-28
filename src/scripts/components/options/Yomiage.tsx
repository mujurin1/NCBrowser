import React from "react";
import { speechApis } from "../../api/ncbOptionsApi";
import { useTypedDispatch, useTypedSelector } from "../../app/store";
import { changeSpeechApi, switchSpeech } from "../../features/ncbOptionsSlice";
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";

export function Yomiage() {
  const dispatch = useTypedDispatch();
  const ncbOption = useTypedSelector((state) => state.ncbOption.options);

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
            onChange={(e) => dispatch(changeSpeechApi(e.target.value))}
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
