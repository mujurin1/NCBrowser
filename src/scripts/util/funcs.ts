import { HttpStatusError } from "../common/errors";

/**
 * 入力内容の取得・チェック
 * @returns 視聴ページUrl
 */
export function getInputLiveUrl(): string {
  const inputLiveUrlElement = document.getElementById("inputLiveUrl") as HTMLInputElement;
  return inputLiveUrlElement.value;
}

/**
 * 指定時間待機する
 * @param ms 待機時間ms
 */
export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * a - b の差の "H:MM:SS" を返す
 * @param a 
 * @param b 
 */
export function calcDateToFomat(a: Date, b: Date): string {
  const dif = (a.getTime() - b.getTime()) / 1000;

  const h = Math.floor(dif / 3600);
  const m = `${Math.floor(dif % 3600 / 60)}`.padStart(2, "0");
  const s = `${dif % 60}`.padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * URLからページのテキストを取得する
 * @param url テキスト取得先
 * @returns Promise<テキスト>
 * @throws HttpStatusError 取得先の応答が異常だった
 */
export function getHttpText(url: string): Promise<string> {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new HttpStatusError(res.url, res.status);
      return res.text();
    });
}

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