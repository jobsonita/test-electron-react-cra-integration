import React, { useEffect } from 'react';

import { channels } from '../shared/constants'

import logo from './logo.svg';
import './App.css';

const { ipcRenderer } = window

function App() {
  useEffect(() => {
    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, data) => {
      const { appName, appVersion } = data;
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      console.log(appName, appVersion);
    });
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
