import { getHttpText, sleep } from "./funcs";

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
 * @throws HttpStatusError 取得先の応答が異常だった
 */
export function getHTML(
  url: string,
  recursive: boolean = false
): Promise<Document> {
  return recursive
    ? getHttpText(url).then((text) => {
        const parser = new DOMParser();
        return parser.parseFromString(text, "text/html");
      })
    : new Promise((resolve) => chainTask(() => resolve(getHTML(url, true))));
}

/**
 * ニコニコのユーザーIDからユーザー名を取得する
 * @param userId ニコニコユーザーID
 * @param recursive false
 * @returns Promise<ユーザー名>
 * @throws HttpStatusError 取得先の応答が異常だった
 */
export function getNicoUserName(
  userId: string,
  recursive: boolean = false
): Promise<string> {
  return recursive
    ? getHttpText(`https://www.nicovideo.jp/user/${userId}/video?rss=2.0`).then(
        (text) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "application/xml");
          return xml.getElementsByTagName("dc:creator")[0].innerHTML;
        }
      )
    : new Promise((resolve) =>
        chainTask(() => resolve(getNicoUserName(userId, true)))
      );
}

/**
 * アカウントIDからアカウントアイコンURLを生成する
 */
export function createNicoUserIconUrl(id: number): string {
  return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(
    id / 10000
  )}/${id}.jpg`;
}

const defaultIconUrl =
  "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

/**
 * アカウントIDからそのユーザーのアイコンURLを取得する
 * アイコンURLが存在しなくてもデフォルトURLを返す
 * @param userId ユーザーID（数値）
 * @returns そのユーザーのアイコンURL
 */
export function getNicoUserIconUrl(userId: number): Promise<string> {
  // この関数はAPIを利用するわけでは無いので、chainTaskしない
  const iconUrl = createNicoUserIconUrl(userId);
  return fetch(iconUrl)
    .then((res) => {
      return res.ok ? iconUrl : defaultIconUrl;
    })
    .catch((e) => {
      // そもそもHTTP通信が成立しなかった？
      return defaultIconUrl;
    });
}
