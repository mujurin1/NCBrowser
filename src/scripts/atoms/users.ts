import { atom, useRecoilState } from "recoil";
import { Chat } from "../../types/commentWs/Chat";
import { NicoUser } from "../../types/NicoUser";
import { logger } from "../util/logging";
import { getNicoUserIconUrl, getNicoUserName } from "../util/nico";
import { loadUserCotehan, saveUserKotehan } from "../util/storage";

/**
 * ユーザー一覧  
 * 放送に接続し直すたびにリセット。あるいは`atomFamily`を使え
 */
export const usersState = atom<Record<string, NicoUser>>({
  key: "usersState",
  default: {},
  dangerouslyAllowMutability: true,
});

/**
 * チャット情報からユーザー情報を更新する
 */
export function useUpdateUserFromChat() {
  const [users, setUsers] = useRecoilState(usersState);
  const updateKotehan = useUpdateKotehan();

  return (chat: Chat) => {
    let newUsers = { ...users };
    const anonymous = chat.anonymity === 1;
    const kotehan = lookupKotehan(chat);
    // この枠で初めてコメントしたユーザー
    // (過去ログを取得しきれて居ない場合はこの限りではない)
    if (users[chat.user_id] == null) {
      newUsers[chat.user_id] = {
        userId: chat.user_id,
        anonymous: anonymous,
        iconUrl: undefined,
        kotehan: kotehan === "" ? undefined : kotehan,
        kotehanNo: kotehan === "" ? -1 : chat.no,
      };
      // 生IDユーザーならアイコンURLをセットする
      if (!anonymous) {
        getNicoUserIconUrl(Number(chat.user_id))
          .then(iconUrl => {
            setUsers({ ...users, [chat.user_id]: { ...users[chat.user_id], iconUrl: iconUrl } });
          });
      }
    } else {
      if (kotehan === "")
        updateKotehan(chat.user_id, kotehan, chat.no, true);
      setUsers(newUsers);
    }
  }
}

/**
 * コテハンをローカルストレージの情報で上書きする  
 * 生IDユーザーの場合はユーザー名で上書きするかを選ぶ
 */
export function useUpdateKotehanFromLocalStorage() {
  const setKotehan = useUpdateKotehan();
  const setKotehanFromNicoUserPage = useUpdateKotehanFromNicoUserPage();

  // isNotExistedSetUserName
  return (userId: string, anonymous: boolean, isNotExistedSetUserName: boolean) => {
    // isNotExistedSetUserName: コテハンが保存されてなかった場合に、
    //                          生IDユーザーはアカウント名をコテハンにするか
    loadUserCotehan(userId, anonymous)
      .then(kotehan => {
        if (kotehan != null)
          setKotehan(userId, kotehan, -1, true);
        else if (isNotExistedSetUserName && !anonymous)
          setKotehanFromNicoUserPage(userId);
      });
  }
}

/**
 * ユーザーのコテハンを上書きする
 */
export function useUpdateKotehan() {
  const [users, setUsers] = useRecoilState(usersState);
  return (userId: string, kotehan: string | undefined, kotehanNo: number, isSave: boolean) => {
    if (users[userId].kotehanNo > kotehanNo)
      return;

    if (isSave)
      saveUserKotehan(userId, kotehan, users[userId].anonymous);

    setUsers({ ...users, [userId]: { ...users[userId], kotehan: kotehan } });
  }
}

/**
 * アカウント名でコテハンを上書きする  
 * `kotehanNo`には-1がセットされる
 */
export function useUpdateKotehanFromNicoUserPage() {
  const setKotehan = useUpdateKotehan();

  return (userId: string) =>
    getNicoUserName(userId)
      .then(kotehan => setKotehan(userId, kotehan, -1, true))
      .catch(e => {
        logger.error(
          `ニコニコユーザーページからのユーザー名の取得に失敗しました。
            userId:${userId}
            ${e}`
        );
      });
}

/**
 * チャット情報からコテハンを取得する
 * @param chat チャット情報
 * @returns "":変更無し  `undefined`:削除  1文字以上:新しいコテハン
 */
function lookupKotehan(chat: Chat): string | undefined {
  // 運営コメなら設定しない
  if (chat.premium === 3 && chat.anonymity == 1) return "";

  let content = chat.content.replace("＠", "@").replace("　", " ");
  // 最初に見つかった"@"以降の文字を調べる
  const index = content.indexOf("@");
  if (index < 0 || index >= content.length)
    return "";
  // "@"の次が空白なら、コテハン削除
  if (content[index + 1] == " ") {
    return undefined;
  }
  return content.substring(index + 1, content.length).split(" ")[0];
}


