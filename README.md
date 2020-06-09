## About

This project demonstrates the use of Electron in conjunction with a React app created through CRA typescript template. The objective is to have a desktop version of a CRA app, which could be configured to have both online and offline capabilities in the long run (though I'm not going to demonstrate how to enable this behaviour in this example).

I'll opt for a single instance app, but that's easily configurable by removing the lines related to it.

## Global Dependencies

This project requires [Node](https://nodejs.org/en/download/package-manager) and [Yarn](https://yarnpkg.com/en/docs/install) installed in your system.

I use [Visual Studio Code](https://code.visualstudio.com) as my preferred code editor.

## Clone and Preview

In a terminal, clone the project and access its root folder:

```
git clone https://github.com/jobsonita/test-electron-react-cra-integration.git
cd test-electron-react-cra-integration
```

At the root of the project, run:

```
yarn
yarn start
```

With a second terminal at the root of the project, run:

```
yarn start-electron
```

## Build and Install

With a terminal open at the root of the project, run:

`Unix`:
```
yarn package
```

`Windows`:
```
yarn package-win
```

Open the generated dist folder and look for the installer for your system (.exe for Windows, .deb for Linux/Ubuntu, .dmg for MacOS).

## Steps to reproduce this project

This project uses these articles as references:
- [Building a production electron/create-react-app application with shared code using electron-builder](https://medium.com/@johndyer24/building-a-production-electron-create-react-app-application-with-shared-code-using-electron-builder-c1f70f0e2649)
- [Desktop application with Electron & React (CRA)](https://dev.to/iampikai/desktop-application-with-electron-react-cra-3ooi)

Follow the steps below to reproduce the creation of this app:

```
yarn create react-app test-electron-react-cra-integration --template typescript
```

Access the folder and open the project in VS Code:

```
cd test-electron-react-cra-integration
code .
```

Test the project in your browser to see how it looks like:

```
yarn start
```

At this point, you can change the React app as you'd do normally, adding pages and routes. You can also configure eslint, prettier or other packages that help maintain your code clean and organized. I'll leave this step for later, as an added bonus, and focus on the integration with electron.

For ease of use with multiple platforms, we'll be using cross-env and copyfiles:

```
yarn add -D cross-env copyfiles
```

Add electron to the project:

```
yarn add -D electron
```

Since CRA scripts only look for files inside the `src` folder and (that's exactly what we want, since) we want to keep our electron app files separate, we're going to create a folder for electron files:

```
mkdir electron
code electron/main.js
```

Fill up `main.js` file with the code below, a slightly modified version of electron's quickstart guide:

```js
const { app, BrowserWindow, globalShortcut } = require('electron')

const path = require('path')
const url = require('url')

/** @type {BrowserWindow} */
let win

function createWindow() {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  })

  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  win.loadURL(startUrl)

  win.once('ready-to-show', () => {
    win.show()
  })
}

function toggleDevTools() {
  win.webContents.toggleDevTools()
}

function createShortcuts() {
  globalShortcut.register('CmdOrCtrl+J', toggleDevTools)
}

app.whenReady().then(createWindow).then(createShortcuts)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

Unfortunately, electron doesn't support typescript natively. We could use tsc package to transpile the code to javascript, allowing us to use typescript in our electron files, but I'll keep it simple for now. Feel free to change the file to `main.ts` and use tsc on start-electron and build-electron scripts down below.

After saving the file, update `package.json` to include the following lines (overwrite fields with the same name, keep all other fields untouched, you can choose to keep `test` and `eject` scripts, but they're not required):

```json
{
  "main": "electron/main.js",
  "scripts": {
    "start": "cross-env BROWSER=none react-scripts start",
    "start-electron": "cross-env ELECTRON_START_URL=http://localhost:3000 electron .",
    "build": "react-scripts build",
    "build-electron": "copyfiles --all \"electron/**/*\" build"
  }
}
```

The `ELECTRON_START_URL` environment variable lets electron know what to display during development. In production, that variable won't be set and electron will instead use the index.html file generated by our `build` script. The `build-electron` script copies the electron folder with out electron files to the build folder.

Go ahead and execute in separate terminals:

```
yarn start
```
```
yarn start-electron
```

You should see a window (with window decorations and menus according to your OS) with the content of your react app. If you're on Windows, press alt to see the menu (we hid it through `autoHideMenuBar: true`). Use Ctrl+J or Cmd+J to open the dev tools (btw, I remove this functionality further down below).

You can also test the build scripts, but we'll make modifications to the structure of the project in the next steps, so keep reading for now.

If you execute `yarn start-electron` in multiple terminals, it should open multiple instances of the app.

In order to limit the app to a single instance, we modify main.js to have the following contents (btw, I'll remove the hotkey for dev tools here, you can still access it through the window menus):

```js
const { app, BrowserWindow } = require('electron')

const path = require('path')
const url = require('url')

/** @type {BrowserWindow} */
let mainWindow

const singleInstanceLock = app.requestSingleInstanceLock()

if (!singleInstanceLock) {
  app.quit()
}

function createWindow() {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  mainWindow.loadURL(startUrl)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})
```

Now, even if you run `yarn start-electron` in multiple terminals, all they'll do is give focus to the first instance.

The next step is to build and package the app. But in order to verify that things work as expected, let's reorganize the react structure a bit and add some communication between the apps.

First, let's move App files (App.tsx, App.css, App.test.tsx and logo.svg) one level down, inside the folder `src/react`. This isn't strictly required, but will keep our app better organized.

We then modify `index.tsx` to point to the new location of `App.tsx`:

```tsx
import App from './react/App';
```

Next, create the files `src/shared/constants.js` and `electron/preload.js` with the following contents:

`src/shared/constants.js`
```js
module.exports = {
  channels: {
    APP_INFO: 'app_info'
  }
}
```

`electron/preload.js`
```js
const { ipcRenderer } = require('electron')
window.ipcRenderer = ipcRenderer
```

If you're transpiling electron through tsc, you can use the ts extension and import-export syntax instead.

We are going to make use of electron's preload to make ipcRenderer available to our react application. This will allow our react and electron apps to communicate through events and listeners.

Modify `electron/main.js` as follows:

```js
const { app, BrowserWindow, ipcMain } = require('electron')

const { channels } = require('../src/shared/constants')

const path = require('path')
const url = require('url')

/** @type {BrowserWindow} */
let mainWindow

const singleInstanceLock = app.requestSingleInstanceLock()

if (!singleInstanceLock) {
  app.quit()
}

function createWindow() {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(startUrl)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion()
  })
})
```

Next, in order to inform our react app that there's an ipcRenderer variable in our window global variable, we modify `react-app-env.d.ts` as follows:

```ts
/// <reference types="react-scripts" />

import { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
  }
}
```

Now, we can make our react app request the information and register a listener to write the received information to the console:

```tsx
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
```

If we execute `yarn start` and `yarn start-electron` and open the dev tools (through the menu, since we removed the hotkey), the console should say `test-electron-react-cra-integration 0.1.0`.

We then have to fix our `build-electron` script to make sure electron still has access to files in `src/shared` when it is copied to the build folder:

`package.json`
```json
    "build-electron": "copyfiles --all \"electron/**/*\" \"src/shared/**/*\" build",
```

Finally, we can build and package everything with the help of `electron-builder`.

```
yarn add -D electron-builder
```

We update our `package.json` with new `package` scripts and a `build` field that is used by electron-builder. We also add a few fields that help identify our app and locate some files:

```json
  "productName": "My Product Name",
  "author": {
    "name": "My Company Name",
    "email": "me@my-company.com"
  },
  "description": "My product description",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "start": "cross-env BROWSER=none react-scripts start",
    "start-electron": "cross-env ELECTRON_START_URL=http://localhost:3000 electron .",
    "build": "react-scripts build",
    "build-electron": "copyfiles --all \"electron/**/*\" \"src/shared/**/*\" build",
    "package-windows": "yarn build && yarn build-electron && electron-builder build --win -c.extraMetadata.main=build/electron/main.js --publish never",
    "package-linux": "yarn build && yarn build-electron && electron-builder build --linux -c.extraMetadata.main=build/electron/main.js --publish never",
    "package-mac": "yarn build && yarn build-electron && electron-builder build --mac -c.extraMetadata.main=build/electron/main.js --publish never"
  },
  "build": {
    "appId": "com.my-company-name.my-electron-app-name",
    "files": [
      "build/**/*",
      "node_modules/**/*"
    ],
    "publish": {
      "provider": "github",
      "repo": "test-electron-react-cra-integration",
      "owner": "jobsonita"
    }
  },
```

Then, we run our script:

```
yarn package-<platform>
```

Note: we can only build the Mac installer from Mac. Also, `package-linux` can fail on some Windows versions/environment configurations.

A `dist` folder will be generated containing the installer. We can add it to our `.gitignore` in order to avoid uploading the installers to the version control (they're quite big, it's better to upload them to some cdn system and link to it).

`.gitignore`
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

Now, just install your app and run it. It'll also create an uninstaller that you can use through your system's control panel.
