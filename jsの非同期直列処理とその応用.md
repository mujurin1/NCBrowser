メモった日の日付 2022/2/15  
この日放送に来てくれた人に教えてもらった。ありがとう

# javascriptの非同期直列処理

まず、javascriptは関数の実行は必ず、同時に１つのみ  
１度に非同期で関数を実行しようとしても、非同期関数の実行が終わるまで、
別の非同期関数は実行されない

例
```javascript
async function method() {
  new Promise(() => {
    for(let i=0; i<10000; i++)
      log(i);
  });
}
method(); // １回め
method(); // ２回め
```
ログの出力は、0から9999までが順番に2回表示される  
もし、Promiseが同時実行されれば、
1回めと2回めが混ざって表示される


# 応用

```javascript
async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}
let latestPromise = Promise.resolve();
function chainTask(task: () => void) {
  latestPromise = latestPromise
    .finally(task)
    .finnaly(() => sleep(1000));
}

chainTask(() => log("TaskA"));
chainTask(() => log("TaskB"));
}
```
これは、１秒以上間隔を開けてタスクを実行するコード

`chainTask`は１つ前のプロミス（タスク実行→１秒待機）が終了したら、  
渡されたタスクを実行し、１秒待機するプロミスを登録する関数  
`latestPromise`は最後に登録されたタスクを実行するプロミス  
初期値として、実行が終了したプロミスを登録しておく

処理の流れは以下

1. `chainTask`を「タスクA」を引数に実行する  
   * タスクAを引数に実行する`chainTask`関数の説明
   1. `latestPromise`には現在`Promise.resolve()`のプロミスが保存されている
   2. そのプロミスの実行が終了したら、タスクAを実行する
   3. タスクAが終了したら、１秒待機する
   4. **ⅲ** で待機するプロミスを新しく`latestPromise`に保存する
2. `chainTask`を「タスクB」引数に実行する
   * タスクBを引数に実行する`chainTask`関数の説明
   1. `latestPromise`には **1** により、タスクAを実行して
      １秒待機するプロミスが保存されている
   2. そのプロミスの実行が終了したら、タスクBを実行する
   3. タスクBが終了したら、１秒待機する
   4. **ⅲ** で待機するプロミスを新しく`latestPromise`に保存する

[javascriptの非同期直列処理](#javascriptの非同期直列処理)で説明した  
javascriptの関数実行の直列性により、  
`chainTask`が同時に実行されることはない

そのため、`cahinTask`実行時の`latestPromise`は必ず違うプロミスである
