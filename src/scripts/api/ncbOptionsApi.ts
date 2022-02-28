const _optionsKey = "options";

export const speechApis = ["棒読みちゃん", "ブラウザ読み上げ"] as const;

export type OptionsType = {
  options: {
    general: {};
    yomiage: {
      on: boolean;
      useSpeechApi: typeof speechApis[number];
    };
  };
};

/**
 * オプションを取得する
 * @returns オプション
 */
export async function loadOptions(): Promise<OptionsType> {
  const options = await chrome.storage.local.get(_optionsKey);
  return (await chrome.storage.local.get(_optionsKey)) as OptionsType;
}

/**
 * オプションを保存する
 * @param options 保存するオプション
 */
export async function saveOptions(options: OptionsType) {
  await chrome.storage.local.set(options);
}
