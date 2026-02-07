let wsBridge;
let bridgeConnected = false;

const BRIDGE_URL = "wss://extraction-log-machinery-nat.trycloudflare.com";

function log(msg){
  document.getElementById("miningLog").innerText += msg + "\n";
}

function connectBridge(){
  wsBridge = new WebSocket(BRIDGE_URL);

  wsBridge.onopen = ()=>{
    bridgeConnected = true;
    log("🌉 Bridge connected");
  };

  wsBridge.onclose = ()=>{
    bridgeConnected = false;
    log("❌ Bridge disconnected");
    setTimeout(connectBridge,3000);
  };

  wsBridge.onerror = e => log("Bridge error");

  wsBridge.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.type==="newBlock"){
      blockchain.push(d.block);
      log("⬇ Block synced");
    }
  };
}

window.onload = connectBridge;
