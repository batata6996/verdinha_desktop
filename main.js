const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Cria uma janela de navegação.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: `${__dirname}/preload.js`
    }
  });

  // Carrega o site do Instagram diretamente.
  win.loadURL('https://www.instagram.com');
}

// Chamado quando o Electron terminar de inicializar.
app.whenReady().then(createWindow);

// Encerra o aplicativo quando todas as janelas são fechadas.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
