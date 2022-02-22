
/**
 * 視聴者・コメント数等情報
 */
export type Statistics = {
  type: "statistics";
  data: {
    /** 累計視聴者数 */
    viewers: number;
    /** 累計コメント数 */
    comments: number;
    /** 累計広告ポイント */
    adPoints: number;
    /** 累計ギフトポイント */
    giftPoints: number;
    /** 同接数 0:居ない 1:居る */
    concurrentViewerScale: number;
  }
}

/*
{
  "type": "statistics",
  "data": {
    "viewers": 19,
    "comments": 38,
    "adPoints": 0,
    "giftPoints": 0,
    "concurrentViewerScale": 1
  }
}
 */