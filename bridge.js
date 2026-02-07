// ===============================
// SofiaCoin Bridge
// ===============================
window.wsBridge = null;
window.bridgeConnected = false;

const BRIDGE_URL = "wss://exclusive-ana-phones-hypothetical.trycloudflare.com";

function connectVPSBridge() {
  console.log("🌉 Connecting to VPS bridge...");
  window.wsBridge = new WebSocket(BRIDGE_URL);

  window.wsBridge.onopen = () => {
    window.bridgeConnected = true;
    console.log("✅ VPS bridge connected");
  };

  window.wsBridge.onerror = (e) => {
    console.error("❌ VPS bridge error", e);
  };

  window.wsBridge.onclose = () => {
    window.bridgeConnected = false;
    console.log("❌ VPS bridge disconnected, retrying...");
    setTimeout(connectVPSBridge, 3000);
  };

  window.wsBridge.onmessage = (msg) => {
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
        logMining("⛏️ New block received");
      }

    } catch (err) {
      console.error("Bridge parse error", err);
    }
  };
}

// стартираме автоматично
window.addEventListener("load", () => {
  connectVPSBridge();
});

// ===============================
// Test bridge
// ===============================
function testBridge() {
  if (window.bridgeConnected) alert("✅ Bridge is connected!");
  else alert("❌ Bridge not connected");
}
