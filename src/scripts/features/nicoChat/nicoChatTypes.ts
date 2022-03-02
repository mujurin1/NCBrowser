import { EntityState } from "@reduxjs/toolkit";

export type NicoChat = {
  user: EntityState<NicoUser>;
  chat: EntityState<ChatMeta>;
  transactionUserIds: Record<string, string>;
};

export type NicoUser = {
  /** ユーザーID */
  userId: string;
  /** コメントの種別 */
  type: "Liver" | "Listner" | "Operator";
  /** 184か */
  anonymous: boolean;
  /** アイコンのURL （184はダミーURL） */
  iconUrl: string;
  /**
   * コテハン\
   * この値が`chrome.storage.local`に保存されている\
   * 無ければこのユーザーIDの値は保存されてない
   */
  kotehan: string | undefined;
};

export type ChatMeta = {
  /** 一意なID */
  nanoId: string;
  /** コメント番号。公式放送は`undefined` */
  no: number;
  /** コメント時刻 UNIX時刻(UTC+9) */
  date: number;
  /** コマンド */
  mail: string | undefined;
  /** ユーザーID */
  userId: string;
  /** プレ垢か？ */
  isPremium: boolean;
  /** 184か？ */
  isAnonymity: boolean;
  /** コメントユーザーの種別 */
  senderType: "Liver" | "Listner" | "Operator";
  /** コメント */
  comment: string;
  /** 自分自身のコメントか */
  yourpost: boolean;
};
