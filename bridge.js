let wsBridge = null;
let bridgeConnected = false;

const BRIDGE_URL = "wss://extraction-log-machinery-nat.trycloudflare.com";

function connectBridge() {
  console.log("🌉 Connecting to bridge...");
  wsBridge = new WebSocket(BRIDGE_URL);

  wsBridge.onopen = () => {
    bridgeConnected = true;
    console.log("✅ Bridge connected");
    const logDiv = document.getElementById("miningLog");
    if(logDiv) logDiv.innerText += "✅ Bridge connected\n";
  };

  wsBridge.onerror = (e) => {
    console.error("❌ Bridge error", e);
    const logDiv = document.getElementById("miningLog");
    if(logDiv) logDiv.innerText += "❌ Bridge error\n";
  };

  wsBridge.onclose = () => {
    bridgeConnected = false;
    console.log("❌ Bridge disconnected, retrying...");
    const logDiv = document.getElementById("miningLog");
    if(logDiv) logDiv.innerText += "❌ Bridge disconnected, retrying...\n";
    setTimeout(connectBridge, 3000);
  };

  wsBridge.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type === "sync") {
        blockchain = data.blockchain || [];
        minedSoFar = data.minedSoFar || 0;
        mempool = [];
        updateBalance();
        logMining("🔄 Synced from bridge");
      }
      if (data.type === "newBlock") {
        blockchain.push(data.block);
        updateBalance();
        logMining(`⛏️ New block #${data.block.index} received`);
      }
    } catch(err){
      console.error("Bridge parse error", err);
    }
  };
}

// Стартираме автоматично при load
window.addEventListener("load", () => {
  connectBridge();
});

// Test bridge function
function testBridge(){
  if (!wsBridge) return alert("Bridge not initialized yet!");
  if (wsBridge.readyState === WebSocket.OPEN) {
    alert("✅ Bridge is connected!");
  } else {
    alert("❌ Bridge is NOT connected!");
  }
}
