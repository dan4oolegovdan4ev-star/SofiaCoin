let wsBridge = null;
let bridgeConnected = false;

// Тук сложи своя Cloudflare Tunnel WSS адрес
const BRIDGE_URL = "wss://extraction-log-machinery-nat.trycloudflare.com";

function connectBridge() {
  console.log("🌉 Connecting to Bridge...");

  wsBridge = new WebSocket(BRIDGE_URL);

  wsBridge.onopen = () => {
    bridgeConnected = true;
    console.log("✅ Bridge connected");
  };

  wsBridge.onerror = (e) => console.error("❌ Bridge error", e);

  wsBridge.onclose = () => {
    bridgeConnected = false;
    console.log("❌ Bridge disconnected, retrying...");
    setTimeout(connectBridge, 3000);
  };

  wsBridge.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);

      if(data.type==="sync"){
        blockchain = data.blockchain||[];
        minedSoFar = data.minedSoFar||0;
        mempool=[];
        updateBalance();
        console.log("🔄 Synced from bridge");
      }

      if(data.type==="newBlock"){
        blockchain.push(data.block);
        updateBalance();
        console.log("⛏️ New block received");
      }

      if(data.type==="tx"){
        mempool.push(data.tx);
        updateBalance();
        console.log("💸 Transaction received");
      }

    } catch(err){ console.error("Bridge parse error", err); }
  };
}

window.addEventListener("load", connectBridge);

function testBridge(){
  if(bridgeConnected) alert("✅ Bridge is working!");
  else alert("❌ Bridge not connected yet.");
}
