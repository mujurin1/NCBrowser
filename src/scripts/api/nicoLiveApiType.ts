
/**
 * 放送情報
 */
export type LiveInfo = {
  liveType: "community" | "channel";
  /** コミュ・チャンネル名 */
  homeName: string;
  /** コミュ・チャンネルID */
  homeId: string;
  /** 放送者ユーザーID。チャンネルなら空文字 */
  liverId: string;
  /** 放送説明 */
  description: string;
  /** コミュニティのみ存在する。コミュレベル */
  level: number;
  /** コミュ・チャンネルをフォローしているか */
  isFollowed: boolean;
  /** コミュ・チャンネルをフォローしているか  
   * （公式はこのプロパティが存在しない?）
   */
  isJoined: boolean;
  /** チャンネルのみ。提供者名（コミュニティ所有者名？） */
  companyName: string;
  /** フォロワー・会員限定か */
  isFollowerOnly: boolean;
  /** 放送者名 */
  liverName: string;
  /** 放送状態 */
  status: "END" | "ON_AIR" | "BEFORE_RELEASE";
  /** 放送タイトル */
  title: string;
  /** タグ編集可能か */
  isTagLocked: boolean;
  /** タグリスト */
  tags: Tag[];
  /** 公式放送か */
  isOfficial: boolean;
}

/**
 * タグ（カテゴリ含む）情報
 */
export type Tag = {
  /** タグ名 */
  text: string;
  /** 大百科が存在するか */
  existsNicopediaArticle: boolean;
  /** 大百科URL（存在しなくても値は入っている） */
  nicopediaArticlePageUrl: string;
  type: "category" | "";
  /** タグロックされているか */
  isLocked: boolean;
  /** 削除可能か */
  isDeletable: boolean;
}
