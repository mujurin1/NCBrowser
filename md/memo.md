
nicoLiveApi.connectNicoLiveで実行している
`JSON.parse(livePage.getElementById("embedded-data").getAttribute("data-props"));`
の内容
* socialGroup
  * type          "community" | "channel"
  * name          コミュ・チャンネル名
  * id            コミュ・チャンネルID
  * description   放送説明
  * level         Num コミュニティ放送のみ。コミュニティレベル
  * isFollowed    T/F コミュ・チャンネルをフォローしてるか
  * isJoined    ? T/F チャンネルのメンバーか？コミュはisFollowedと同じ値
                      （公式はこのプロパティが存在しない?）
  * companyName   チャンネルのみ。提供者名（コミュニティ所有者名？）
* program
  * title         放送タイトル
  * supplier
    * name        放送者名
  * status        放送状態 "END" | "ON_AIR" | "BEFORE_RELEASE"
  * tag
    * isLocked    タグを編集可能か
    * list        タグ情報の配列
        text        タグ名
        existsNicopediaArticle  T/F大百科が存在するか
        nicopediaArticlePageUrl 大百科URL（存在しなくてもある）
        type        "category":カテゴリ "":普通のタグ
        isLocked    T/F タグロックされているか
        isDeletable T/F 削除可能か
  * isFollowerOnly T/F フォロワー限定。会員限定
* broadcasterBroadcastRequest
  * recievedUserId  放送者ユーザーID。チャンネルなら空文字

# Web Speech API
音声認識の文法はJSGF  
読み上げの文法はSSML

読み上げのSSMLは読み上げエンジンによってサポートまちまちなので使えない
