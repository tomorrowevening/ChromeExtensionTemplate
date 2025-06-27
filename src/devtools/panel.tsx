// src/devtools/panel.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import extension from '../extension'

// We'll hold the port in module scope so our click handler can see it
let panelPort: chrome.runtime.Port;

const App: React.FC = () => {
  const [msgs, setMsgs] = useState<any[]>([]);

  useEffect(() => {
    panelPort = chrome.runtime.connect({ name: 'panel' });

    // Send init so background knows which tab we're for
    const tabId = chrome.devtools.inspectedWindow.tabId;
    panelPort.postMessage({ type: 'panel-init', tabId });

    // Listen for messages relayed from page
    panelPort.onMessage.addListener(msg => {
      console.log('panel.tsx: received from page', msg);
      setMsgs(prev => [...prev, msg]);
    });

    panelPort.onDisconnect.addListener(() => {
      console.log('panel.tsx: port disconnected');
    });

    return () => {
      console.log('panel.tsx: cleanup, disconnecting port');
      panelPort.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>{extension.name} Panel</h1>
      <button
        onClick={() => {
          console.log('panel.tsx: sending ping to page');
          panelPort.postMessage({ from: 'panel', payload: 'Ping from panel' });
        }}
      >
        Send Ping
      </button>
      <ul>
        {msgs.map((msg, i) => (
          <li key={i}><pre>{JSON.stringify(msg, null, 2)}</pre></li>
        ))}
      </ul>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
