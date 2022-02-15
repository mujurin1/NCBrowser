
/**
 * 放送開始,延長時に受信する  
 * システムウェブソケットが受信する
 */
export type ScheduleData = {
  type: "schedule";
  data: {
    /** 放送開始時刻 */
    begin: string;
    /** 放送終了時刻(予定) */
    end: string;
  }
}

/*
{
  "type": "schedule",
  "data": {
    "begin": "2022-02-10T13:23:06+09:00",
    "end": "2022-02-10T14:23:06+09:00"
  }
}
 */