import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NcbOption = {
  bouyomiChanOn: boolean;
};

const initialState: NcbOption = {
  bouyomiChanOn: false,
};

const ncbOptionSlice = createSlice({
  name: "ncbOption",
  initialState: initialState,
  reducers: {
    bouyomiChanSwitch(state, action: PayloadAction) {
      state.bouyomiChanOn = !state.bouyomiChanOn;
    },
  },
  extraReducers(builder) {
    builder;
  },
});

export const ncbOptionReducer = ncbOptionSlice.reducer;

export const { bouyomiChanSwitch } = ncbOptionSlice.actions;
