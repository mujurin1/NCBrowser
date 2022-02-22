import { atom, useRecoilState } from "recoil";
import { Chat } from "../../types/commentWs/Chat";
import { useUpdateUserFromChat } from "./users";

/**
 * チャット情報
 */
export const chatDataState = atom({
  key: "chatDataState",
  default: [] as Chat[],
  dangerouslyAllowMutability: false,
});

/**
 * 新しいチャットの情報を追加する
 */
export function useAddChatData() {
  const [chatData, setChatData] = useRecoilState(chatDataState);
  const updateUserFromChat = useUpdateUserFromChat();

  return (chat: Chat) => {
    setChatData([...chatData, chat]);
    updateUserFromChat(chat);
  }
}
