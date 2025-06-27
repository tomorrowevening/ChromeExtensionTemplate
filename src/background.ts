import extension from './extension';

// src/background.ts
console.log('background.ts: service worker loaded');

// Track ports per tab
interface Ports { panel?: chrome.runtime.Port; page?: chrome.runtime.Port }
const ports: Record<number, Ports> = {};

// Relay incoming connections
chrome.runtime.onConnect.addListener(port => {
  console.log('background.ts: onConnect', port.name, 'sender=', port.sender);

  // PANEL SIDE: wait for a panel-init to register its tabId
  if (port.name === 'panel') {
    // console.log('background.ts: panel port connected, awaiting init');
    let tabId: number | null = null;

    port.onMessage.addListener(msg => {
      console.log('background.ts: message from panel', msg);
      if (msg.type === 'panel-init' && typeof msg.tabId === 'number') {
        tabId = msg.tabId;
        if (tabId === null) return;
        ports[tabId] = ports[tabId] || {};
        ports[tabId].panel = port;
        // console.log(`background.ts: panel registered for tab ${tabId}`);
      }
      else if (tabId !== null) {
        // forward everything else to the page
        const pagePort = ports[tabId].page;
        if (pagePort) pagePort.postMessage(msg);
      }
    });

    port.onDisconnect.addListener(() => {
      if (tabId !== null) {
        delete ports[tabId].panel;
        console.log(`background.ts: panel disconnected for tab ${tabId}`);
      }
    });
    return;
  }

  // PAGE SIDE: register immediately by sender.tab.id
  if (port.name === 'page') {
    const tabId = port.sender?.tab?.id;
    if (typeof tabId !== 'number') {
      return;
    }

    ports[tabId] = ports[tabId] || {};
    ports[tabId].page = port;

    port.onMessage.addListener(msg => {
      const panelPort = ports[tabId].panel;
      if (panelPort) panelPort.postMessage(msg);
    });

    port.onDisconnect.addListener(() => {
      delete ports[tabId].page;
      console.log(`background.ts: page disconnected for tab ${tabId}`);
    });
    return;
  }
});

// On toolbar click: reload + inject
chrome.action.onClicked.addListener(tab => {
  const tabId = tab.id;
  if (typeof tabId !== 'number') return;
  console.log('background.ts: icon clicked, reload tab', tabId);

  chrome.tabs.reload(tabId);

  const listener = (id: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (id === tabId && changeInfo.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      chrome.scripting.executeScript({
        target: { tabId },
        files: extension.files
      });
    }
  };
  chrome.tabs.onUpdated.addListener(listener);
});
