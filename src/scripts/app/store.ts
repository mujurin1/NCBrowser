import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { chatDataReducer } from "../features/chatData/chatDataSlice";
import { nicoLiveReducer } from "../features/nicoLive/nicoLiveSlice";
import { nicoUsersReducer } from "../features/nicoUsers/nicoUsersSlice";

export const store = configureStore({
  reducer: {
    nicoUsers: nicoUsersReducer,
    chatData: chatDataReducer,
    nicoLive: nicoLiveReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
