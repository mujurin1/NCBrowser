import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { chatDataReducer } from "../features/chatDataSlice";
import { ncbOptionReducer } from "../features/ncbOptionSlice";
import { nicoLiveReducer } from "../features/nicoLiveSlice";
import { nicoUsersReducer } from "../features/nicoUsersSlice";

export const store = configureStore({
  reducer: {
    nicoUsers: nicoUsersReducer,
    chatData: chatDataReducer,
    nicoLive: nicoLiveReducer,
    ncbOption: ncbOptionReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
