import { CommentViewItem } from "../../types/CommentViewItem";
import { Chat } from "../../types/commentWs/Chat";
import { NicoUser } from "../../types/NicoUser";
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

/**
 * チャット情報からコテハンを取得する
 * @param chat チャット情報
 * @returns
 *   コテハンが存在すれば1文字以上の文字列  
 *   存在しなければ空の文字列  
 *   コテハンを削除するなら`undefined`
 */
export function parseKotehan(chat: Chat): string | undefined {
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

/**
 * チャットデータをコメントビューアアイテムに変換して取得する
 */
export function makeChatDataToCommentViewItem(chatData: Chat[], users: Record<string, NicoUser>, liveStartTime: Date) {
  return chatData.map((chat): CommentViewItem => {
    const user = users[chat.user_id];
    return {
      id: `${chat.no}`,
      anonymous: user?.anonymous,  // タイミング次第ではuserが存在しないことがある?
      no: chat.no,
      iconUrl: user?.iconUrl,
      userId: chat.user_id,
      kotehan: user?.kotehan,
      time: calcDateToFomat(new Date(chat.date * 1000), liveStartTime),
      comment: chat.content
    };
  });
}
