// /*
//  * 棒読みちゃんAPI
//  * ローカルで起動した棒読みちゃんに読み上げさせる
//  *
//  * 棒読みちゃん Ver0.1.11.0 Beta21 以降必須
//  *
//  * [メモ]
//  * 棒読みちゃん連携デモページ
//  * https://chi.usamimi.info/Program/Application/BouyomiChan/Sample_HtmlConnection.html
//  * 棒読みちゃんをダウンロードしたファイルに使用例等がある
//  * /SampleSrc/SampleSrc.txt にfetchの例も書いてる
//  */

// /** 棒読みちゃんの読み上げボイス */
// export type BouyomiVoice = {
//   id: number;
//   kind: string;
//   name: string;
//   alias: string;
// };

// /** 棒読みちゃんのボイス一覧 */
// let _bouyomiVoices: BouyomiVoice[] = [];

// /** 読み上げさせるボイスのId */
// export let selectVoiceId: number = 0;

// /** 棒読みちゃんのHTTPポート */
// export let bouyomiPort: number = 50080;

// /** 棒読みちゃんのボイス一覧を取得します */
// export const getBouyomiVoices = () => _bouyomiVoices;

// /** 使用可能なボイスリストを更新する */
// export async function bouyomiVoiceUpdate() {
//   const res = await fetch(`http://localhost:${bouyomiPort}/GetVoiceList`);
//   _bouyomiVoices = (await res.json()) as BouyomiVoice[];
// }

// /**
//  * 棒読みちゃんに読み上げさせる\
//  * @param 棒読みちゃんが読み上げたタスクのID
//  */
// export async function bouyomiTalk(text: string): Promise<number> {
//   const res = await fetch(`http://localhost:${bouyomiPort}/talk?text=${text}`, {
//     mode: "no-cors",
//     headers: { "Content-Type": "text/plain" },
//   });
//   const data = await res.json();
//   return Number(data.taskId);
// }

// // 初期化
// bouyomiVoiceUpdate();
