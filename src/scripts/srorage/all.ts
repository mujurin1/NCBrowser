import {
  initialNcbOptions,
  ncbOptionsKey,
  NcbOptionsStorage,
} from "./ncbOptionsType";
import {
  initialNicoUsers,
  nicoUsersKey,
  NicoUsersStorage,
} from "./nicoUsersType";

/** ストレージ全体のタイプ */
export type AllStorage = {
  [ncbOptionsKey]: NcbOptionsStorage;
  [nicoUsersKey]: NicoUsersStorage;
};

/** ストレージ全体の初期値 */
export const initialAllStorage: AllStorage = {
  [ncbOptionsKey]: initialNcbOptions,
  [nicoUsersKey]: initialNicoUsers,
};

/** ストレージ全体を読み取る */
export async function loadAllStorage(): Promise<AllStorage> {
  const data = await chrome.storage.local.get();
  if (Object.keys(data).length === 0) {
    saveAllStorage(initialAllStorage);
    return initialAllStorage;
  }
  return { ...initialAllStorage, ...data };
}

/** ストレージ全体を保存する */
export async function saveAllStorage(data: AllStorage) {
  await chrome.storage.local.set(data);
}

/**
 * 大項目データを保存する
 * @param key 大項目キー名
 * @param data 保存するデータ
 */
export async function saveMajorStorage(key: string, data: any): Promise<void> {
  await chrome.storage.local.set({ [key]: data });
}

/**
 * 大項目データを読み取る\
 * キーが存在しなければ初期値で保存する\
 * 存在しない項目は初期値で上書きされる
 * @param key 大項目キー名
 * @param initialData データの初期値
 * @return 読み取ったデータ
 */
export async function loadMajorStorage<T>(
  key: string,
  initialData: T
): Promise<T> {
  const data = (await chrome.storage.local.get(key))?.[key];
  if (Object.keys(data).length === 0) {
    await saveMajorStorage(key, initialData);
    return initialData;
  }
  return { ...initialData, ...data };
}
