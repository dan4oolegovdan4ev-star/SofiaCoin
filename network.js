const WS = "wss://extraction-log-machinery-nat.trycloudflare.com";
const sock = new WebSocket(WS);

export function broadcast(type, data) {
  sock.send(JSON.stringify({ type, data }));
}

sock.onmessage = e => {
  const { type, data } = JSON.parse(e.data);
  if (type === "CHAIN" && data.length > window.chain.chain.length)
    window.chain.chain = data;
};
