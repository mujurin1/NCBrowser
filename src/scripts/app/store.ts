import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// import { ncbOptionReducer } from "../features/ncbOptionsSlice";
import { nicoChatReducer } from "../features/nicoChat/nicoChatSlice";
import { nicoLiveReducer } from "../features/nicoLiveSlice";
import { storageReducer } from "../features/storageSlice";

export const store = configureStore({
  reducer: {
    nicoLive: nicoLiveReducer,
    // ncbOption: ncbOptionReducer,
    nicoChat: nicoChatReducer,
    storage: storageReducer,
  },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<AppState> = useSelector;

export const storageSelector = (state: AppState) => state.storage.storage;
export const nicoChatSelector = (state: AppState) => state.nicoChat;
export const nicoLiveSelector = (state: AppState) => state.nicoLive;
