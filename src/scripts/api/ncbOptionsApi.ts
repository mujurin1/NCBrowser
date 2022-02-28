import { OptionsType, initialOptions } from "./ncbOptionsApiType";

const _optionsKey = "options";

/**
 * オプションを取得する
 * @returns オプション
 */
export async function loadOptions(): Promise<OptionsType> {
  let options = (await chrome.storage.local.get([_optionsKey]))
    .options as OptionsType;
  if (options == null) {
    options = initialOptions;
    saveOptions(options);
  }
  return { ...initialOptions, ...options };
}

/**
 * オプションを保存する
 * @param options 保存するオプション
 */
export async function saveOptions(options: OptionsType) {
  await chrome.storage.local.set({ options: options });
}
