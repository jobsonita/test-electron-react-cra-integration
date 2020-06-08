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
