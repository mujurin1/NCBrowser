import { Trigger } from "../scripts/common/Trigger";

describe("Trigger", () => {
  test("Normal", () => {
    const trigger = new Trigger<[number]>();
    let num = 0;
    trigger.add((v) => (num += v));
    trigger.fire(10);
    trigger.fire(5);
    expect(num).toBe(15);
  });
  test("addOnce", () => {
    const trigger = new Trigger<[number]>();
    let num = 0;
    trigger.addOnce((v) => (num += v));
    trigger.fire(10);
    trigger.fire(5);
    expect(num).toBe(10);
  });
  test("delete", () => {
    const trigger = new Trigger<[number]>();
    let num = 0;
    const fn = (v: number) => (num += v);
    trigger.add(fn);
    trigger.fire(10);
    trigger.delete(fn);
    trigger.fire(5);
    expect(num).toBe(10);
  });
});
