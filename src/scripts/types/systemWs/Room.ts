export type Room = {
  type: "room";
  data: {
    /** 部屋名 おそらくアリーナしかない */
    name: string;
    /** コメントサーバー接続用データ？ */
    messageServer: {
      uri: string;
      type: string;
    };
    /** 多分昔のアリーナなどの部屋IDのなごり？ */
    threadId: string;
    /** 多分、コメント投稿時に必要なKey */
    yourPostKey: string;
    /** ？ */
    isFirst: boolean;
    /** ？ "waybackkey" */
    waybackkey: string;
    /** ChatData.vpos の基準時刻(枠開始時刻？) */
    vposBaseTime: string;
  };
};

/*
{
  "type": "room",
  "data": {
    "name": "アリーナ",
    "messageServer": {
      "uri": "wss://msgd.live2.nicovideo.jp/websocket",
      "type": "niwavided"
    },
    "threadId": "M.o_CFGPo7SAc7MHN3rYsjFg",
    "yourPostKey": "T.urLyii5OwYrfBwLFLMjfM3tVgbxCWqeRogOiDR-TNkAM7pBkzk_Xq0OV",
    "isFirst": true,
    "waybackkey": "waybackkey",
    "vposBaseTime": "2022-02-10T13:21:57+09:00"
  }
}
 */
