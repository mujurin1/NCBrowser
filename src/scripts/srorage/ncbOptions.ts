import {
  NcbOptionsStorage,
  initialNcbOptions,
  ncbOptionsKey,
} from "./ncbOptionsType";
import { loadMajorStorage, saveMajorStorage } from "./all";

/**
 * NCBのオプションを取得する
 * @returns オプション
 */
export async function loadNcbOptions(): Promise<NcbOptionsStorage> {
  return await loadMajorStorage(ncbOptionsKey, initialNcbOptions);
}

/**
 * NCBのオプションを保存する
 * @param ncbOptions オプション
 */
export async function saveNcbOptions(ncbOptions: NcbOptionsStorage) {
  await saveMajorStorage(ncbOptionsKey, ncbOptions);
}
