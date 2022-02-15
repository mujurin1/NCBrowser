import { AkashicData } from "./AkashicData";
import { GetAkashicData } from "./GetAkashicData";
import { RoomData } from "./RoomData";
import { ScheduleData } from "./ScheduleData";
import { SeatData } from "./SeatData";
import { ServerTimeData } from "./ServerTimeData";
import { StatisticsData } from "./StatisticsData";
import { StreamData } from "./StreamData";
import { SystemPingData } from "./SystemPingData";

/**
 * システム用ウェブソケットが返すメッセージJsonデータタイプ
 */
export type SystemWsMessage =
  GetAkashicData | AkashicData | RoomData | ScheduleData | SeatData |
  ServerTimeData | StatisticsData | StreamData | SystemPingData;
