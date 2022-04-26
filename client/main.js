const {
    app,
    BrowserWindow
  } = require('electron')
  const url = require("url");
  const path = require("path");
  
  let appWindow
  
  function initWindow() {
    appWindow = new BrowserWindow({
      // fullscreen: true,
      height: 864,
      width: 1536,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    })

    appWindow.loadFile('/src/assets/bell.wav')
    appWindow.loadFile('/src/assets/bin.wav')
    appWindow.loadFile('/src/assets/cell_notif.wav')
    appWindow.loadFile('/src/assets/email.wav')
    appWindow.loadFile('/src/assets/error.wav')
    appWindow.loadFile('/src/assets/error.wav')
    appWindow.loadFile('/src/assets/msg.wav')
    appWindow.loadFile('/src/assets/notif.wav')
    appWindow.loadFile('/src/assets/ui1.wav')
    appWindow.loadFile('/src/assets/ui2.wav')
  
    // Electron Build Path
    appWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/client/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
    //appWindow.setMenuBarVisibility(false)
  
    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()
  
    appWindow.on('closed', function () {
      appWindow = null
    })
  }
  
  app.on('ready', initWindow)
  
  // Close when all windows are closed.
  app.on('window-all-closed', function () {
  
    // On macOS specific close process
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', function () {
    if (win === null) {
      initWindow()
    }
  })