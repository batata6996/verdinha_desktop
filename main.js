const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true,
    contextIsolation: true,
    webPreferences: {
      sandbox: false
    }
  });

  win.loadURL('https://meetpoint.jala.university/app/meta/chatslist');
  win.maximize();
win.webContents.on('did-finish-load', () => {
  win.webContents.executeJavaScript(`
    (function () {
      if (window.__ultimateThemeToggleInjected) return;
      window.__ultimateThemeToggleInjected = true;

      let darkEnabled = true;

      const host = document.createElement('div');
      host.id = '__electron-theme-toggle-root';
      host.style.position = 'fixed';
      host.style.top = '0';
      host.style.left = '0';
      host.style.width = '100vw';
      host.style.height = '100vh';
      host.style.pointerEvents = 'none';
      host.style.zIndex = '2147483647';

      document.documentElement.appendChild(host);

      const shadow = host.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.innerHTML = \`
        html {
          filter: invert(1) hue-rotate(180deg) !important;
          background: #000 !important;
        }

        img, video, iframe, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      \`;
      document.head.appendChild(style);

      const btn = document.createElement('div');
      btn.style.position = 'fixed';
      btn.style.bottom = '110px';
      btn.style.right = '18px';
      btn.style.width = '36px';
      btn.style.height = '36px';
      btn.style.borderRadius = '50%';
      btn.style.background = '#fbfbfb';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.cursor = 'pointer';
      btn.style.pointerEvents = 'auto';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      btn.style.userSelect = 'none';

      const icon = document.createElement('div');
      icon.innerHTML = \`
      <svg id="themeMoonIcon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="black">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      \`;

      icon.style.display = 'flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.width = '100%';
      icon.style.height = '100%';


      icon.style.filter = 'none';
      icon.style.webkitFilter = 'none';
      icon.style.isolation = 'isolate';

      btn.appendChild(icon);
      shadow.appendChild(btn);

      btn.onclick = () => {
        darkEnabled = !darkEnabled;

        if (darkEnabled) {
          style.disabled = false;
          icon.innerHTML = \`
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="black">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          \`;
        } else {
          style.disabled = true;
          icon.innerHTML = \`
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                 fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          \`;
        }

        icon.style.filter = 'none';
        icon.style.webkitFilter = 'none';
        icon.style.isolation = 'isolate';
      };

      const observer = new MutationObserver(() => {
        if (!document.getElementById('__electron-theme-toggle-root')) {
          document.documentElement.appendChild(host);
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

    })();
  `);
});

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
  