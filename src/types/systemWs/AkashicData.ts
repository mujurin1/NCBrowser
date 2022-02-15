
export type AkashicData = {
  type: "akashic";
  data: {
    playId: string;
    contentUrl: string;
    logServerUrl: string;
    status: string;
    token: string;
    playerId: string;
  }
}

/*
{
  "type": "akashic",
  "data": {
    "playId": "50504670",
    "contentUrl": "https://ak.cdn.nimg.jp/coe/contents/aufeiR7C/nicocas/4.0.0/content.json",
    "logServerUrl": "wss://ap-msg03.coe.nicovideo.jp/4002/",
    "status": "ready",
    "token": "88a5c1fbffe6c42ff7e50b54b6b964cd3115147e7b60ade6776f89b5ac29e8d0",
    "playerId": "31103661"
  }
}
 */