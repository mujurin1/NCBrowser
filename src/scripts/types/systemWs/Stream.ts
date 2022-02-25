export type Stream = {
  type: "stream";
  data: {
    uri: string;
    syncUri: string;
    quality: string;
    availableQualities: string[];
    protocol: string;
  };
};

/*
{
  "type": "stream",
  "data": {
    "uri": "https://vodedge660.dmc.nico/hlslive/ht2_nicolive/nicolive-production-pg43644028453479_516dd51b2c2c6a5934cf454640d6b9bf9c53cde35a8f6b3f5d924faedbd50231/master.m3u8?ht2_nicolive=31103661.823qi7yi5g_r72pbk_lsp1b3jcf9us",
    "syncUri": "https://vodedge660.dmc.nico/hlslive/ht2_nicolive/nicolive-production-pg43644028453479_516dd51b2c2c6a5934cf454640d6b9bf9c53cde35a8f6b3f5d924faedbd50231/stream_sync.json?ht2_nicolive=31103661.823qi7yi5g_r72pbk_lsp1b3jcf9us",
    "quality": "abr",
    "availableQualities": [
      "abr",
      "broadcaster_high",
      "broadcaster_low",
      "super_high",
      "high",
      "normal",
      "low",
      "super_low",
      "audio_high"
    ],
    "protocol": "hls"
  }
}
 */
