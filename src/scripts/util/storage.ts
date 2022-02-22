
/*
 * chrome.storage 系統
 */

/* ユーザーコテハン保存・取得
{
  "realUserData": {
    "1": "user1_NAME",
    "2": "user2_NAME",
  },
  "anonymousUserData": {
    "a": "user_Name",
    "b": "user_Name",
  }
}
 */

/**
 * ユーザーコテハンを取得する
 * @param userId ニコ生ユーザーID
 * @param isAnonymouse 取得するユーザーは184か
 */
 export function loadUserCotehan(userId: string, isAnonymouse: boolean): Promise<string> {
  const key = isAnonymouse ? "anonymousUserData" : "realUserData";
  return chrome.storage.local.get({ [key]: { userId } })
    .then(x => x[key][userId])
    .catch(_ => undefined);
}
/**
 * ユーザーコテハンを保存する
 * @param userId ニコ生ユーザーID
 * @param kotehan コテハン `undefined`なら削除
 * @param isAnonymouse 取得するユーザーは184か
 */
export function saveUserKotehan(userId: string, kotehan: string | undefined, isAnonymouse: boolean): Promise<void> {
  if (kotehan == null) {
    removeUserKotehan(userId, isAnonymouse);
    return;
  }
  const key = isAnonymouse ? "anonymousUserData" : "realUserData";
  // １度全件取得して追記、保存
  return chrome.storage.local.get(key)
    .then(x => {
      x[key] = { ...x[key], [userId]: kotehan };
      const a = chrome.storage.local.set(x);
      return a;
    });
}
/**
 * ユーザーコテハンを削除する
 * @param userId 削除するユーザーID
 * @param isAnonymouse 取得するユーザーは184か
 */
export function removeUserKotehan(userId: string, isAnonymouse: boolean): Promise<void> {
  const key = isAnonymouse ? "anonymousUserData" : "realUserData";
  return chrome.storage.local.get(key)
    .then(x => {
      delete x[key][userId];
      const a = chrome.storage.local.set(x);
      return a;
    });
}
