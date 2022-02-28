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
export async function loadUserKotehan(
  userId: string,
  isAnonymouse: boolean
): Promise<string> {
  const key = isAnonymouse ? "anonymousUserData" : "realUserData";
  try {
    const x = await chrome.storage.local.get({ [key]: { userId } });
    return x[key][userId];
  } catch (_) {
    return undefined;
  }
}
/**
 * ユーザーコテハンを保存する
 * @param userId ニコ生ユーザーID
 * @param kotehan コテハン `undefined`または空文字なら削除
 * @param isAnonymouse 取得するユーザーは184か
 */
export async function saveUserKotehan(
  userId: string,
  kotehan: string | undefined,
  isAnonymouse: boolean
): Promise<void> {
  if (kotehan == null || kotehan == "") {
    removeUserKotehan(userId, isAnonymouse);
    return;
  }
  const key = isAnonymouse ? "anonymousUsers" : "realUser";
  // １度全件取得して追記、保存
  const x = await chrome.storage.local.get(key);

  x[key] = { ...x[key], [userId]: kotehan };
  const a = chrome.storage.local.set(x);
  return await a;
}
/**
 * ユーザーコテハンを削除する
 * @param userId 削除するユーザーID
 * @param isAnonymouse 取得するユーザーは184か
 */
export async function removeUserKotehan(
  userId: string,
  isAnonymouse: boolean
): Promise<void> {
  const key = isAnonymouse ? "anonymousUsers" : "realUser";
  const x = await chrome.storage.local.get(key);
  delete x[key][userId];
  const a = chrome.storage.local.set(x);
  return await a;
}
