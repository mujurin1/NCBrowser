
export type ServerTimeData = {
  type: "serverTime";
  data: {
    currentMs: string;
  }
}

/*
{
  "type": "serverTime",
  "data": {
    "currentMs": "2022-02-10T14:16:32.340+09:00"
  }
}
*/