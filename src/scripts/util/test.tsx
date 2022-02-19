import React from "react";
import { useEffect, useState } from "react";


// 下準備
export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(store.state);
  useEffect(() => {
    const callback = () => setState(store.state);
    store.listen(callback);
    return () => store.unlisten(callback);
  }, [store]);
  return state
}

export class Store<T> {
  private callbacks = new Set<Function>();

  constructor(public state: T) { }

  listen(callback: () => void) {
    this.callbacks.add(callback)
  }

  unlisten(callback: () => void) {
    this.callbacks.delete(callback)
  }

  setState = (state: T) => {
    this.state = state;
    this.callbacks.forEach(fn => fn());
  }
}

// 使い方

const UsersStore = new class extends Store<string[]> {
  addUser(user: string) {
    this.setState([...this.state, user]);
  }
}([]);

function MyComponent() {
  const users = useStore(UsersStore);

  return <div>
    {/* <button onClick={() => UsersStore.state.push("FALSE")}>{UsersStore.state.length}人いるよ</button> */}
    <span>{users.length}人いるよ</span>
    <button onClick={() => UsersStore.addUser('foo')}>追加</button>
  </div>
}
