## createSelector
```typescript
const selector = createSelector(
  // 第１引数の関数たちの引数は全て同じ。同じ値が入る。
  // この関数たちの引数が生成されたセレクターの引数になる
  [
    // user この関数の実行結果が第２引数の１番めに入る
    (state: RootState, userId: string) => state.users.entities[userId],
    // book この関数の実行結果が第２引数の２番めに入る
    (state: RootState, userId: string, bookId: string) => state.books.entities[bookId],
    // message この関数の実行結果が第２引数の３番めに入る
    // 純粋に第２引数の関数でmessageが欲しいので、ここでmessageを第４引数にしていし、そのまま帰す
    (state: RootState, userId: string, bookId: string, message: string) => message
  ],
  (user, book, message) => {
    return [user, book, book.message == message];
  }
)
const result = selector(state, "userId_1", "bookId_3");

selectorの実行順序可視化 (state, userId, bookId, message){
  // createSelector第１引数の関数を順番に実行
  const _user = state.users.entities[userId];
  const _book = state.books.entities[bookId];
  const _message = message;
  return [_user, _book, book.message == _message]
}
```
`selector`の引数が同じなら、実行されずにメモされた値を返す。
さらに、第１引数で指定された関数の戻り値が全て同じなら、第２引数の関数は実行されずに、メモ化された値を返す。
