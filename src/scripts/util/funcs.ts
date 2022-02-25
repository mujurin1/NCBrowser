import { Chat } from "../types/commentWs/Chat";

/**
 * 入力内容の取得・チェック
 * @returns 視聴ページUrl
 */
export function getInputLiveUrl(): string {
  const inputLiveUrlElement = document.getElementById(
    "inputLiveUrl"
  ) as HTMLInputElement;
  return inputLiveUrlElement.value;
}

/**
 * 指定時間待機する
 * @param ms 待機時間ms
 */
export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * a - b の差の "H:MM:SS" を返す
 * @param a
 * @param b
 */
export function calcDateToFomat(a: Date, b: Date): string {
  const dif = (a.getTime() - b.getTime()) / 1000;

  const h = Math.floor(dif / 3600);
  const m = `${Math.floor((dif % 3600) / 60)}`.padStart(2, "0");
  const s = `${dif % 60}`.padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * URLからページのテキストを取得する
 * @param url テキスト取得先
 * @returns Promise<テキスト>
 * @throws 取得先の応答が異常だった
 */
export function getHttpText(url: string): Promise<string> {
  return fetch(url).then((res) => {
    if (!res.ok)
      throw new Error(
        `HTTP応答が異常でした。\nurl:${res.url}\nstatusCode${res.status}`
      );
    return res.text();
  });
}

/**
 * チャット情報からコテハンを取得する
 * @param chat チャット情報
 * @returns
 *   コテハンを更新 [コテハン, コテハンNo]
 *   更新しない     ["", -1]
 */
export function parseKotehan(chat: Chat): [string, number] {
  // 運営コメなら設定しない
  if (chat.premium === 3 && chat.anonymity == 1) return ["", -1];

  let content = chat.content.replace("＠", "@").replace("　", " ");
  // 最初に見つかった"@"以降の文字を調べる
  const index = content.indexOf("@");
  if (index < 0 || index >= content.length) return ["", -1];
  // "@"の次が空白なら、コテハン削除
  if (content[index + 1] == " ") {
    return [undefined, -1];
  }
  return [content.substring(index + 1, content.length).split(" ")[0], chat.no];
}
