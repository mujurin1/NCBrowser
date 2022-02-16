
/*
 * ログ用
 */

export type LogLevel = "Info" | "Warn" | "Error";

export type Log = {
  logLevel: LogLevel;
  message: string;
}

let logHistory: Log[] = [];

export const logger = {
  /** LogLevel:`Info` でログを記録する */
  info: (message: string) => writeLog(message, "Info"),
  /** LogLevel:`Warn` でログを記録する */
  warn: (message: string) => writeLog(message, "Warn"),
  /** LogLevel:`Error` でログを記録する */
  error: (message: string) => writeLog(message, "Error"),
};

/**
 * ログを記録する
 * @param log 記録するログ
 */
export function writeLog(message: string, logLevel: LogLevel) {
  logHistory.push({ logLevel, message });
}

/**
 * ログを取得する
 * @param logLevel 取得するログレベル 指定しなければ全て
 * @returns 記録されたログ配列
 */
export function readLog(logLevel?: LogLevel): Log[] {
  if (logLevel == null) return [...logHistory];
  return logHistory.filter(log => log.logLevel == logLevel);
}
