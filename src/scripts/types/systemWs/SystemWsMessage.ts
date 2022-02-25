import { Akashic } from "./Akashic";
import { GetAkashic } from "./GetAkashic";
import { Room } from "./Room";
import { Schedule } from "./Schedule";
import { Seat } from "./Seat";
import { ServerTime } from "./ServerTime";
import { Statistics } from "./Statistics";
import { Stream } from "./Stream";
import { SystemPing } from "./SystemPing";

/**
 * システム用ウェブソケットが返すメッセージJsonデータタイプ
 */
export type SystemWsMessage =
  | GetAkashic
  | Akashic
  | Room
  | Schedule
  | Seat
  | ServerTime
  | Statistics
  | Stream
  | SystemPing;
