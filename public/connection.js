let connected = true

const connection = chrome.runtime.connect({ name: 'page' });

connection.onDisconnect.addListener(() => {
  connected = false
})

connection.onMessage.addListener(msg => {
  console.log('connection.js: from panel', msg);
});

function sendMessage(value) {
  if (!connected) return;
  connection.postMessage(value);
}

sendMessage({ value: 'Hello from page', sender: 'connection.js' });
