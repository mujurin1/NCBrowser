// ======================== 定数宣言 ========================
export const nicoUsersKey = "nicoUsers";
export const nicoUsersAnonymityKey = "anonymity";
export const nicoUsersRealKey = "real";

// ======================== タイプ宣言 ========================
/** ニコニコユーザーストレージ項目 */
export type NicoUsersStorage = {
  [nicoUsersAnonymityKey]: Record<string, NicoUserStorage>;
  [nicoUsersRealKey]: Record<string, NicoUserStorage>;
};

/** ユーザー１人分の項目 */
export type NicoUserStorage = {
  userId: string;
  kotehan: string;
};

// =======
/** ニコニコユーザーストレージ初期値 */
export const initialNicoUsers: NicoUsersStorage = {
  [nicoUsersAnonymityKey]: {},
  [nicoUsersRealKey]: {},
};
