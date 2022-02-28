import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { ncbOptionReducer } from "../features/ncbOptionsSlice";
import { nicoChatReducer } from "../features/nicoChat/nicoChatSlice";
import { nicoLiveReducer } from "../features/nicoLiveSlice";

export const store = configureStore({
  reducer: {
    nicoLive: nicoLiveReducer,
    ncbOption: ncbOptionReducer,
    nicoChat: nicoChatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
