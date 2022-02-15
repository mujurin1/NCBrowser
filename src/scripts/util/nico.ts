import { sleep } from "./funcs";

/* 
 * ニコニコのサイトからデータを取得する関数たち
 * 
 * 制限に掛からないようにするため、ページの取得は１秒に１回制限
 * 
 */

/** ページの取得を待機する関数 */
const waitForLoading = () => sleep(1000);
// 最後に実行されるタスクのプロミス
let lastPromise = Promise.resolve();

function chainTask(func: () => void) {
  lastPromise = lastPromise.finally(func).finally(waitForLoading);
}

/**
 * UrlからHTMLDocumentを返す
 * @param url ページURL
 * @param recursive false
 * @returns Promise<URLのドキュメント>
 */
export function getHTML(url: string, recursive: boolean = false): Promise<Document> {
  return recursive
    ? fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`url:${url} の応答が異常でした。\nstatus code: ${res.status}`);
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        return parser.parseFromString(html, "text/html");
      })
    : new Promise(resolve =>
      chainTask(() => resolve(getHTML(url, true))));
}

/**
 * ニコニコのユーザーIDからユーザー名を取得する
 * @param userId ニコニコユーザーID
 * @param recursive false
 * @returns Promise<ユーザー名>
 */
export function getNicoUserName(userId: string, recursive: boolean = false): Promise<string> {
  return recursive
    ? fetch(`https://www.nicovideo.jp/user/${userId}/video?rss=2.0`)
      .then(res => {
        if (!res.ok) throw new Error(`ユーザー名の取得に失敗しました。\nuserId: ${userId}\nstatus code: ${res.status}`);
        return res.text();
      })
      .then(xml => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "application/xml");
        return doc.getElementsByTagName("dc:creator")[0].innerHTML;
      })
    : new Promise(resolve =>
      chainTask(() => resolve(getNicoUserName(userId, true))));
}

