/*
 * ログ用
 */

export type LogLevel = "Info" | "Warn" | "Error";

export type Log = {
  logLevel: LogLevel;
  message: LogMessage;
};

export type LogMessage = {
  /** ログを書き込んだクラスや関数名等 */
  writePoint: string;
  /** ログに書き込む内容 */
  content: string;
};

let logHistory: Log[] = [];

export const logger = {
  /** LogLevel:`Info` でログを記録する */
  info: (writePoint: string, content: string) =>
    writeLog(writePoint, content, "Info"),
  /** LogLevel:`Warn` でログを記録する */
  warn: (writePoint: string, content: string) =>
    writeLog(writePoint, content, "Warn"),
  /** LogLevel:`Error` でログを記録する */
  error: (writePoint: string, content: string) =>
    writeLog(writePoint, content, "Error"),
};

/**
 * ログを記録する
 * @param log 記録するログ
 */
export function writeLog(
  writePoint: string,
  content: string,
  logLevel: LogLevel
) {
  logHistory.push({ logLevel, message: { writePoint, content } });
}

/**
 * ログを取得する
 * @param logLevel 取得するログレベル 指定しなければ全て
 * @returns 記録されたログ配列
 */
export function readLog(logLevel?: LogLevel): Log[] {
  if (logLevel == null) return [...logHistory];
  return logHistory.filter((log) => log.logLevel == logLevel);
}
