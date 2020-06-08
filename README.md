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
