// import { logger } from "../util/logging";

// 棒読みちゃんAPIを使うようになったので不要

// /**
//  * 読み上げAPI用設定
//  */
//  export type SpeechType = {
//   on: boolean;
//   voiceName: string;
//   lang: string;
//   pitch: number;
//   rate: number;
//   volume: number;
// }

// /**
//  * ブラウザ 読み上げAPI
//  * `SpeechSynthesisUtterance`を使用している
//  * `SpeechSynthesis`は(少なくともChromeでは)ブラウザで1つのものを共有しているので、
//  * 他のサイト又はコメビュを多重起動して読み上げていると、それらと干渉してしまう。
//  *
//  * uttr: https://developer.mozilla.org/ja/docs/Web/API/SpeechSynthesis
//  * speech: https://developer.mozilla.org/ja/docs/Web/API/SpeechSynthesisUtterance
//  * 参考: https://qiita.com/hmmrjn/items/be29c62ba4e4a02d305c
//  */
// export class BrowserSpeechAPI {
//   static readonly #voices: SpeechSynthesisVoice[] = speechSynthesis.getVoices();
//   static readonly #textQueue: string[] = [];
//   /** 読み上げるかどうか */
//   static #on: boolean = false;
//   static #voice: SpeechSynthesisVoice;
//   static #lang: string = "ja-JP";
//   static #pitch: number = 1;
//   static #rate: number = 1;
//   static #volume: number = 0.6;

//   public static set lang(value) { BrowserSpeechAPI.#lang = value; }
//   public static set pitch(value) { BrowserSpeechAPI.#pitch = value; }
//   public static set rate(value) { BrowserSpeechAPI.#rate = value; }
//   public static set volume(value) { BrowserSpeechAPI.#volume = value; }
//   public static get lang() { return BrowserSpeechAPI.#lang; }
//   public static get pitch() { return BrowserSpeechAPI.#pitch; }
//   public static get rate() { return BrowserSpeechAPI.#rate; }
//   public static get volume() { return BrowserSpeechAPI.#volume; }

//   /** ボイス一覧を取得します */
//   public static get voices() { return BrowserSpeechAPI.#voices }
//   public static get voiceName() { return BrowserSpeechAPI.#voice.name; }
//   public static set voiceName(value) {
//     BrowserSpeechAPI.#voice = BrowserSpeechAPI.voices.find(v => v.name === value);
//   }

//   /** 読み上げを一時停止中か */
//   public static get paused() { return speechSynthesis.paused }
//   /** 読み上げ処理中か（発話してるかではないので一時停止中でも`true`になる） */
//   public static get speeking() { return speechSynthesis.speaking }

//   /**
//    * 通常は呼び出す必要は無い
//    * SpeechAPIインポート時に自動的に呼び出される
//    */
//   public static initialize() {
//     speechSynthesis.onvoiceschanged = () => {
//       BrowserSpeechAPI.#voices.splice(0);
//       BrowserSpeechAPI.#voices.push(...speechSynthesis.getVoices());
//     }

//     logger.info("SpeechAPI", "初期化しました");
//   }

//   /**
//    * 読み上げる文章を追加します
//    * @param text 読み上げる文章
//    */
//   public static pushText(text: string) {
//     BrowserSpeechAPI.#textQueue.push(text);
//     if (BrowserSpeechAPI.#on && !BrowserSpeechAPI.speeking) BrowserSpeechAPI.speak();
//   }

//   /** 読み上げを開始します */
//   public static start() {
//     if (!BrowserSpeechAPI.#on) {
//       BrowserSpeechAPI.#on = true;
//       this.speak();
//     }
//   }

//   /**
//    * 読み上げを停止します
//    * @param readingStop 現在読み上げている場合に強制的に停止します
//    */
//   public static stop(readingStop: boolean) {
//     BrowserSpeechAPI.#on = false;
//     if (readingStop) BrowserSpeechAPI.skip();
//   }
//   /** 現在読み上げている文章をスキップします */
//   public static skip() {
//     speechSynthesis.cancel();
//   }
//   /** 読み上げを停止し、文章キューを削除します */
//   public static reset() {
//     BrowserSpeechAPI.#textQueue.splice(0);
//   }

//   /** 発声を一時停止します */
//   static speechPause() {
//     speechSynthesis.pause();
//   }
//   /** 発声を再開します */
//   public static speechResume() {
//     speechSynthesis.resume();
//   }

//   /**
//    * 文章をキューから取り出して読み上げる
//    */
//   private static speak() {
//     const text = BrowserSpeechAPI.#textQueue.shift();
//     if (text == null) return;
//     const uttr = new SpeechSynthesisUtterance(text);
//     uttr.voice = BrowserSpeechAPI.#voice;
//     uttr.pitch = BrowserSpeechAPI.#pitch;
//     uttr.lang = BrowserSpeechAPI.#lang;
//     uttr.rate = BrowserSpeechAPI.#rate;
//     uttr.volume = BrowserSpeechAPI.#volume;
//     uttr.onend = BrowserSpeechAPI.#end;
//     uttr.onerror = e => {
//       logger.error("SpeechAPI", `読み上げに失敗しました\n${e.error}`);
//       BrowserSpeechAPI.#end();
//     }

//     speechSynthesis.speak(uttr);
//     return;
//   }

//   /** 1文章読み上げ終了時に呼ばれる */
//   static #end() {
//     if (BrowserSpeechAPI.#on) {
//       BrowserSpeechAPI.speak();
//     }
//   }
// }

// // export function SpeechTestComponent() {
// //   const [text, setText] = useState("");

// //   return <>
// //     <input type="text" onChange={e => setText(e.target.value)} /><br/>
// //     <button onClick={() => {
// //       SpeechAPI.pushText(text);
// //     }}>読み上げキューに追加</button><br/>
// //     <button onClick={() => SpeechAPI.start()}>読み上げ開始</button>
// //     <button onClick={() => SpeechAPI.stop(false)}>読み上げ停止</button>
// //     <button onClick={() => SpeechAPI.skip()}>スキップ</button>
// //     <button onClick={() => SpeechAPI.stop(true)}>読み上げ停止（読み上げ中のもストップ）</button><br/>
// //     <hr />
// //     <button onClick={() => SpeechAPI.speechPause()}>発声一時停止</button>
// //     <button onClick={() => SpeechAPI.speechResume()}>発声再開</button><br/>
// //   </>
// // }
