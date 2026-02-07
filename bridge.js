// ===============================
// SofiaCoin Cloudflare Tunnel Bridge
// ===============================

let wsBridge = null;
let bridgeConnected = false;

// Замени с твоя Cloudflare Tunnel линк
const BRIDGE_URL = "wss://exclusive-ana-phones-hypothetical.trycloudflare.com";

function connectVPSBridge() {
  console.log("🌉 Connecting to Cloudflare Tunnel bridge...");

  wsBridge = new WebSocket(BRIDGE_URL);

  wsBridge.onopen = () => {
    bridgeConnected = true;
    console.log("✅ Bridge connected!");
  };

  wsBridge.onerror = (e) => {
    console.error("❌ Bridge error", e);
  };

  wsBridge.onclose = () => {
    bridgeConnected = false;
    console.log("❌ Bridge disconnected, retrying in 3s...");
    setTimeout(connectVPSBridge, 3000);
  };

  wsBridge.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);

      // Синхронизация от други майнъри
      if (data.type === "sync") {
        blockchain = data.blockchain || [];
        minedSoFar = data.minedSoFar || 0;
        mempool = [];

        updateBalance();
        console.log("🔄 Synced from network");
      }

      // Нов блок от друг майнер
      if (data.type === "newBlock") {
        blockchain.push(data.block);
        updateBalance();
        console.log("⛏️ New block received:", data.block.hash);
      }

    } catch (err) {
      console.error("Bridge parse error", err);
    }
  };
}

// Стартиране автоматично
window.addEventListener("load", () => {
  connectVPSBridge();
});
