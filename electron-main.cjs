const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  // Crea la finestra del browser.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Nascondi la barra dei menu tipica di windows (File, Modifica, ecc.)
    autoHideMenuBar: true,
    title: "Mio Editor PDF"
  })

  // Se siamo in modalità sviluppo, carica il server di Vite
  // Altrimenti carica il file index.html compilato
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')
    // Apri gli strumenti di sviluppo se vuoi: win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

// Quando Electron ha finito di inizializzarsi
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // Su macOS è comune ricreare una finestra nell'app quando l'icona nel dock viene cliccata e non ci sono altre finestre aperte.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Esci quando tutte le finestre sono chiuse.
app.on('window-all-closed', () => {
  // Su macOS le app solitamente restano attive finché l'utente non esce con Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})