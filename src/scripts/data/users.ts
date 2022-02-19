import { atom, selector, selectorFamily, useSetRecoilState } from "recoil";
import { NicoUser } from "../../types/NicoUser";
import { saveUserKotehan } from "../util/funcs";
import { logger } from "../util/logging";
import { getNicoUserIconUrl, getNicoUserName } from "../util/nico";

/**
 * ユーザー一覧
 */
export const usersState = atom<Record<string, NicoUser>>({
  key: "users",
  default: {}
});


/**
 * ユーザーにコテハンをセットする
 * @param userId コテハンを付けるユーザーID
 * @param kotehan コテハン `undefined`なら削除
 * @param kotehanNo コテハンを設定する強さ
 * @param isSave chrome.storage.localに保存するか
 */
export function useSetKotehan() {
  const setUsers = useSetRecoilState(usersState);
  return (userId: string, kotehan: string | undefined, kotehanNo: number, isSave: boolean) =>
    setUsers(oldUsers => {
      // const setKotehan = useSetKotehan();
      // oldUsers に userId のデータがない場合がある 初コメコテハン等
      if (oldUsers[userId] == null) {
        // setTimeout(() => setKotehan(userId, kotehan, kotehanNo, isSave), 1000);
        return oldUsers;
      }

      if (oldUsers[userId].kotehanNo > kotehanNo) {
        return oldUsers;
      }
      
      const updateUser: NicoUser = {
        userId: userId,
        anonymous: oldUsers[userId].anonymous,
        iconUrl: oldUsers[userId].iconUrl,
        kotehan: kotehan,
        kotehanNo: kotehanNo,
      };

      const newUsers = { ...oldUsers };
      newUsers[userId] = updateUser;
      if (isSave)
        saveUserKotehan(userId, kotehan, updateUser.anonymous);
      return newUsers;
    });
}

/**
 * ニコニコユーザー情報からユーザー名を取得し、
 * そのユーザー名をコテハンとして設定する
 * @param userId 取得設定するユーザーID
 */
export function useSetKotehanFromNicoUserPage() {
  const setKotehan = useSetKotehan();

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
 * ユーザーのアイコンURLをセットする
 * @param userId セットするユーザーID
 */
export function useSetIconUrl() {
  const setUsers = useSetRecoilState(usersState);

  return (userId: number) =>
    getNicoUserIconUrl(userId)
      .then(iconUrl => {
        setUsers(oldUsers => {
          const updateUser: NicoUser = {
            userId: userId+"",
            anonymous: oldUsers[userId].anonymous,
            iconUrl: iconUrl,
            kotehan: oldUsers[userId].kotehan,
            kotehanNo: oldUsers[userId].kotehanNo,
          };
          const newUsers = { ...oldUsers };
          newUsers[userId] = updateUser;
          return newUsers;
        });
      });
}
