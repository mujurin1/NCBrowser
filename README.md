# 開発メモ

useNicoLive.ts の実装がビミョウ。  
というか、useNicoLiveを消したい。けどまだ問題ないのでいつか


chrome.storage.local  
* 最大5M（unlimitedstorage権限で無制限に使える）
* 書き込み・読み込み無制限
* 保存データ項目制限あり

chrome.storage.sync
* アカウント共有ストレージ
* 書き込み・読み込み制限あり
* 保存データ項目制限あり
* 詳しくは https://qiita.com/dhun/items/cf18e43cb0376fcff302
