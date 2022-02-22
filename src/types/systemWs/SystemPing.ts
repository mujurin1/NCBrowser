
/**
 * これを送信されたら、pong,keepSeat を返さないとwsを切断される
 */
export type SystemPing = {
  type: "ping";
}

// {"type":"ping"}