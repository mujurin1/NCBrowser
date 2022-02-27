export type ReplaceSimpleType = {
  /** 優先度 */
  priority: number;
  /** 対象の文字 */
  target: string;
  /** 置換後の文字 */
  after: string;
};
export type ReplaceRegexType = {
  /** 優先度 */
  priority: number;
  /** 適用する正規表現 */
  regex: RegExp;
  /** 置換後の文字 */
  after: string;
};

/**
 * 単純・正規表現置換をするクラス
 *
 * インデックスが大きいほど優先度が高い
 */
export class Replacer {
  /** 優先度の上限（0 ~ maxPriority-1） */
  public readonly maxPriority = 20;

  /** 優先度順に用意された単純置換リスト */
  readonly #simpleList: ReplaceSimpleType[] = [];
  /** 優先度順に用意された正規表現置換リスト */
  readonly #regexList: ReplaceRegexType[] = [];

  constructor() {}

  /**
   * 単純置換を追加する
   * @param target 検索対象文字
   * @param after 置換後の文字
   * @param priority 優先度
   */
  public addSimple(target: string, after: string, priority: number) {
    this.#simpleList.push({ target: target.toUpperCase(), after, priority });
    this.#simpleList.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 正規表現置換を追加する
   * @param regex 正規表現対象
   * @param after 正規表現置換後
   * @param priority 優先度
   */
  public addRegex(regex: string, after: string, priority: number) {
    this.#regexList.push({ regex: new RegExp(regex, "ig"), after, priority });
    this.#regexList.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 単純置換を削除する
   * @param target 検索対象文字
   * @param after 置換後の文字
   * @param priority 優先度
   */
  public deleteSimple(target: string, after: string, priority: number) {
    const deleteIndex = this.#simpleList.findIndex(
      (simple) =>
        simple.target === target &&
        simple.after === after &&
        simple.priority === priority
    );
    if (deleteIndex !== -1) this.#simpleList.splice(deleteIndex, 1);
  }

  /**
   * 正規表現置換を削除する
   * @param regex 正規表現対象
   * @param after 正規表現置換後
   * @param priority 優先度
   */
  public deleteRegex(regex: string, after: string, priority: number) {
    const deleteIndex = this.#regexList.findIndex(
      (simple) =>
        simple.regex.source === regex &&
        simple.after === after &&
        simple.priority === priority
    );
    if (deleteIndex !== -1) this.#regexList.splice(deleteIndex, 1);
  }

  /**
   * テキストを置換する
   * @param text 置換するテキスト
   * @returns 置換後のテキスト
   */
  public repraceText(text: string): string {
    text = text.toUpperCase();
    this.#regexList.forEach((regex) => {
      text = text.replaceAll(regex.regex, regex.after);
    });
    this.#simpleList.forEach((simple) => {
      text = text.replaceAll(simple.target, simple.after);
    });
    return text;
  }
}
