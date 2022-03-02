import {
  nicoUsersAnonymityKey,
  initialNicoUsers,
  nicoUsersKey,
  NicoUsersStorage,
  NicoUserStorage,
  nicoUsersRealKey,
} from "./nicoUsersType";
import { loadMajorStorage, saveMajorStorage } from "./all";

/**
 * ニコニコユーザーデータ全てを取得する
 * @returns オプション
 */
export async function loadNicoUsers(): Promise<NicoUsersStorage> {
  return await loadMajorStorage(nicoUsersKey, initialNicoUsers);
}

/**
 * ニコニコユーザーデータ全てを保存する
 * @param nicoUsers オプション
 */
export async function saveNicoUsers(nicoUsers: NicoUsersStorage) {
  await saveMajorStorage(nicoUsersKey, nicoUsers);
}

/**
 * ユーザーIDからニコニコユーザーデータを取得する
 * @param userId ユーザーID
 * @param isAnonymity 匿名か
 * @returns ユーザーデータ
 */
export async function loadNicoUser(
  userId: string,
  isAnonymity: boolean
): Promise<NicoUserStorage> {
  const nicoUsers = await loadNicoUsers();
  const key = isAnonymity ? nicoUsersAnonymityKey : nicoUsersRealKey;
  return nicoUsers[key]?.[userId];
}

/**
 * ユーザーを保存する
 * @param nicoUser ユーザーデータ
 * @param isAnonymity 匿名か
 */
export async function saveNicoUser(
  nicoUser: NicoUserStorage,
  isAnonymity: boolean
) {
  const nicoUsers = await loadNicoUsers();
  const key = isAnonymity ? nicoUsersAnonymityKey : nicoUsersRealKey;
  nicoUsers[key][nicoUser.userId] = nicoUser;
  saveNicoUsers(nicoUsers);
}
