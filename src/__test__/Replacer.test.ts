import { Replacer } from "../scripts/common/Replacer";

describe("Replacer", () => {
  test("Priority", () => {
    const replacer = new Replacer();
    replacer.addSimple("あいうえお", "かきくけこ", 10);
    replacer.addRegex("あいう", "かきく", 3);
    replacer.addSimple("えお", "てと", 5);
    replacer.addRegex("か", "さ", 2);
    expect(replacer.repraceText("あいうえお")).toBe("さきくてと");
  });
  describe("Simple", () => {
    test("Normal", () => {
      const replacer = new Replacer();
      replacer.addSimple("犬", "猫", 1);
      expect(replacer.repraceText("犬と犬")).toBe("猫と猫");
    });
    test("循環", () => {
      const replacer = new Replacer();
      replacer.addSimple("あいう", "かきく", 1);
      replacer.addSimple("かきく", "あいう", 1);
      expect(replacer.repraceText("あいうえお")).toBe("あいうえお");
    });
    test("増殖", () => {
      const replacer = new Replacer();
      replacer.addSimple("あいう", "あいうあいう", 1);
      expect(replacer.repraceText("あいうえお")).toBe("あいうあいうえお");
    });
    test("削除", () => {
      const replace = new Replacer();
      replace.addSimple("あいうえお", "かきくけこ", 1);
      replace.deleteSimple("あいうえお", "かきくけこ", 1);
      expect(replace.repraceText("あいうえお")).toBe("あいうえお");
    });
    test("大文字小文字", () => {
      const replace = new Replacer();
      replace.addSimple("AA", "アスキーアート", 1);
      expect(replace.repraceText("aa")).toBe("アスキーアート");
    });
  });
  describe("Regex", () => {
    test("Normal", () => {
      const replacer = new Replacer();
      replacer.addRegex(
        "H?TTPS?://[A-Z0-9+./.%￥&?#$!'()-=¯_:;]+",
        "URL省略",
        1
      );
      expect(replacer.repraceText("Https://example.com/index?target=10")).toBe(
        "URL省略"
      );
    });
    test("循環", () => {
      const replacer = new Replacer();
      replacer.addRegex("あいう", "かきく", 1);
      replacer.addRegex("かきく", "あいう", 1);
      expect(replacer.repraceText("あいうえお")).toBe("あいうえお");
    });
    test("増殖", () => {
      const replacer = new Replacer();
      replacer.addRegex("あいう", "あいうあいう", 1);
      expect(replacer.repraceText("あいうえお")).toBe("あいうあいうえお");
    });
    test("$参照", () => {
      const replace = new Replacer();
      replace.addRegex(">>([0-9]+)-([0-9]+)", "$1から$2へのレス", 1);
      expect(replace.repraceText(">>10-30")).toBe("10から30へのレス");
    });
    test("削除", () => {
      const replace = new Replacer();
      replace.addRegex("あいうえお", "かきくけこ", 1);
      replace.deleteRegex("あいうえお", "かきくけこ", 1);
      expect(replace.repraceText("あいうえお")).toBe("あいうえお");
    });
    test("大文字小文字", () => {
      const replace = new Replacer();
      replace.addRegex("AA", "アスキーアート", 1);
      expect(replace.repraceText("aa")).toBe("アスキーアート");
    });
  });
});
