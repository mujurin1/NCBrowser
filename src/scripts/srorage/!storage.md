このフォルダは`Chrome.storage.local`にデータを保存するファイルを置く

ファイル名がキー名

`all.ts`に全てのストレージのタイプと初期値を定義

## Chromeストレージメモ
`chrome.storage.local.set`は挿入上書き
```
storage.get(undefined) => { KeyA: 1 }
storage.set({ KeyB: 2 })
storage.get(undefined) => { KeyA: 1, KeyB: 2 }
// KeyAとKeyBは両方ある

storage.get(undefined) => { X: { KeyA: 1 } }
storage.set({ X: { KeyB: 2 } })
storage.set(undefined) => { X: { KeyB: 2 } }
// X.KeyBしかない
```

## 規約
### タイプ定義
各データのタイプを定義する\
タイプ名は`{キー名}Storage`とする\
例）`type NcbOptionsStorage`

### 定数定義
定数の初期値を定義する\
定数名は`initial{キー名}`とする\
中項目を分けて定義しても良い\
例）`const initialNcbOptions`

### 関数定義
大項目は必ず読み取りと保存の関数を定義する\
読み取り関数名は`load{キー名}`とする\
保存関数名は`save{キー名}`とする\
中項目以下を定義するかは自由\
例）`function loadNcbOptions`

## ストレージの構造
### 全体
```json
// ここにあるキーが大項目
{
  // NCBのオプション
  "ncbOptions": #ncbOptions,
  // ニコニコユーザー
  "nicoUsers": #nicoUsers
}
```

### ncbOptions
```json
ncbOptions: {
  "commentView": {
    // カラム名がKeyのデータが複数ある
    [#カラム]: { #カラムデータ }
  },
  "yomiage": {
    // 読み上げを使用するか
    "on": boolean,
    // 読み上げに使用するAPI
    "useSpeechApi": string
  }
}
カラム: readonly [
  "no",
  "iconUrl",
  "kotehan",
  "time",
  "comment"
]
カラムデータ: {
  // カラムヘッダー幅
  "width": number
}
```

### nicoUsers
```json
nicoUsers: {
  // 生IDユーザーs
  "anonymity": #ニコユーザーデータs,
  // 184ユーザーs
  "real": #ニコユーザーデータs
}
ニコユーザーデータs: {
  // ユーザーIDがKeyのデータが複数ある
  [userId]: {
    // キー名と同じ値
    "userId": string,
    "kotehan": string,
  }
}
```

