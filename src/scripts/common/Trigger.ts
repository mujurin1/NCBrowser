
export type Fn<T extends any[] = []> = (...arg: T) => void;

export interface SetOnlyTrigger<T extends any[] = []> {
  add(fn: Fn<T>): void;
  addOnce(fn: Fn<T>): void;
  delete(fn: Fn<T>): void;
}

/**
 * 関数を登録して、呼び出してもらうやつ
 */
export class Trigger<T extends any[] = []> implements SetOnlyTrigger<T>{
  private readonly funcSet = new Set<Fn<T>>();

  public asSetOnlyTrigger(): SetOnlyTrigger<T> {
    return this;
  }

  public add(fn: Fn<T>) {
    this.funcSet.add(fn);
  }

  public addOnce(fn: Fn<T>) {
    const onceFn = (...args: T) => {
      fn(...args);
      this.delete(onceFn);
    };
    this.add(onceFn);
  }

  public delete(fn: Fn<T>) {
    this.funcSet.delete(fn);
  }

  public fire(...args: T) {
    this.funcSet.forEach(fn => fn(...args));
  }
}
