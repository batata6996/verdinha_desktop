const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const iconPath = path.join(__dirname, 'icon.png');
let mainWindow;
let tray = null;

const updateExe = process.execPath;
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
  path: updateExe,
  args: ['--process-start-args', `"--hidden"`]
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    contextIsolation: true,
    webPreferences: {
      sandbox: false
    }
  });

  mainWindow.loadURL('https://meetpoint.jala.university/app/meta/chatslist');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      (function () {
        if (window.__ultimateThemeToggleInjected) return;
        window.__ultimateThemeToggleInjected = true;

        let darkEnabled = true;
        let alarms = JSON.parse(localStorage.getItem('myClassAlarms') || '[]');
        const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        const host = document.createElement('div');
        host.id = '__electron-tools-root';
        Object.assign(host.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: '2147483647'
        });
        document.documentElement.appendChild(host);
        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.innerHTML = \`
          .fab {
            position: fixed; right: 18px; width: 36px; height: 36px;
            border-radius: 50%; background: #fbfbfb;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; pointer-events: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5); user-select: none;
            transition: transform 0.2s;
          }
          .fab:hover { transform: scale(1.1); }
          .fab svg { width: 20px; height: 20px; }
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); pointer-events: auto;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; visibility: hidden; transition: 0.3s;
          }
          .modal-overlay.open { opacity: 1; visibility: visible; }
          .modal-box {
            background: white; padding: 20px; border-radius: 8px;
            width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            font-family: sans-serif; color: #333;
          }
          .input-group { margin-bottom: 10px; display: flex; flex-direction: column; }
          .input-group label { font-size: 12px; margin-bottom: 4px; color: #666; }
          .input-group input, .input-group select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
          .alarm-list { max-height: 150px; overflow-y: auto; margin: 10px 0; border-top: 1px solid #eee; }
          .alarm-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
          .alarm-info { display: flex; flex-direction: column; }
          .alarm-day { font-size: 11px; color: #888; font-weight: bold; text-transform: uppercase; }
          .btn-danger { color: red; cursor: pointer; font-weight: bold; border: none; background: none; }
          .btn-primary { background: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; width: 100%; }
          .close-modal { float: right; cursor: pointer; font-size: 20px; }
        \`;
        shadow.appendChild(style);

        const globalStyle = document.createElement('style');
        globalStyle.innerHTML = \`html.injected-dark-mode { filter: invert(1) hue-rotate(180deg) !important; background: #000 !important; } html.injected-dark-mode img, html.injected-dark-mode video, html.injected-dark-mode iframe, html.injected-dark-mode svg { filter: invert(1) hue-rotate(180deg) !important; }\`;
        document.head.appendChild(globalStyle);

        const btnTheme = document.createElement('div');
        btnTheme.className = 'fab';
        btnTheme.style.bottom = '110px';
        btnTheme.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        btnTheme.onclick = () => {
          darkEnabled = !darkEnabled;
          if (darkEnabled) {
            document.documentElement.classList.add('injected-dark-mode');
            btnTheme.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
          } else {
            document.documentElement.classList.remove('injected-dark-mode');
            btnTheme.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
          }
        };
        if(darkEnabled) document.documentElement.classList.add('injected-dark-mode');

        const btnAlarm = document.createElement('div');
        btnAlarm.className = 'fab';
        btnAlarm.style.bottom = '160px'; 
        btnAlarm.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
        btnAlarm.onclick = () => { renderAlarms(); modalOverlay.classList.add('open'); };

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = \`
            <div class="modal-box">
                <span class="close-modal">&times;</span>
                <h3>Agendar Aula</h3>
                <div class="input-group">
                    <label>Matéria</label>
                    <input type="text" id="alarmMsg" placeholder="Ex: Inglês">
                </div>
                <div class="input-group">
                    <label>Dia da Semana</label>
                    <select id="alarmDay">
                        <option value="1">Segunda-feira</option>
                        <option value="2">Terça-feira</option>
                        <option value="3">Quarta-feira</option>
                        <option value="4">Quinta-feira</option>
                        <option value="5">Sexta-feira</option>
                        <option value="6">Sábado</option>
                        <option value="0">Domingo</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Horário</label>
                    <input type="time" id="alarmTime">
                </div>
                <button class="btn-primary" id="saveBtn">Salvar Horário</button>
                <div class="alarm-list" id="alarmListContainer"></div>
            </div>
        \`;

        const closeBtn = modalOverlay.querySelector('.close-modal');
        const saveBtn = modalOverlay.querySelector('#saveBtn');
        const msgInput = modalOverlay.querySelector('#alarmMsg');
        const dayInput = modalOverlay.querySelector('#alarmDay');
        const timeInput = modalOverlay.querySelector('#alarmTime');
        const listContainer = modalOverlay.querySelector('#alarmListContainer');

        closeBtn.onclick = () => modalOverlay.classList.remove('open');
        modalOverlay.onclick = (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('open'); };

        function renderAlarms() {
            listContainer.innerHTML = '';
            if (alarms.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center; color:#999; padding:10px;">Sem aulas agendadas.</div>';
                return;
            }
            alarms.sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return a.time.localeCompare(b.time);
            });

            alarms.forEach((alarm, index) => {
                const item = document.createElement('div');
                item.className = 'alarm-item';
                item.innerHTML = \`
                    <div class="alarm-info">
                        <span class="alarm-day">\${daysMap[alarm.day]}</span>
                        <span><strong>\${alarm.time}</strong> - \${alarm.msg}</span>
                    </div>
                    <button class="btn-danger" data-index="\${index}">X</button>
                \`;
                listContainer.appendChild(item);
            });
            
            listContainer.querySelectorAll('.btn-danger').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = e.target.getAttribute('data-index');
                    alarms.splice(idx, 1);
                    localStorage.setItem('myClassAlarms', JSON.stringify(alarms));
                    renderAlarms();
                };
            });
        }

        saveBtn.onclick = () => {
            const msg = msgInput.value;
            const time = timeInput.value;
            const day = parseInt(dayInput.value);
            if (!msg || !time) return alert('Preencha o nome e o horário!');
            alarms.push({ msg, time, day, lastNotified: null });
            localStorage.setItem('myClassAlarms', JSON.stringify(alarms));
            msgInput.value = '';
            renderAlarms();
        };

        if (Notification.permission !== "granted") Notification.requestPermission();

        setInterval(() => {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentTimeString = \`\${currentHours}:\${currentMinutes}\`;
            const currentDayString = now.toDateString(); 

            alarms.forEach(alarm => {
                if (alarm.day === currentDay && alarm.time === currentTimeString && alarm.lastNotified !== currentDayString) {
                    new Notification(" Hora da Aula!", {
                        body: \`Hoje (\${daysMap[currentDay]}): \${alarm.msg}\`,
                        requireInteraction: true
                    });
                    alarm.lastNotified = currentDayString;
                    localStorage.setItem('myClassAlarms', JSON.stringify(alarms));
                }
            });
        }, 5000);

        shadow.appendChild(modalOverlay);
        shadow.appendChild(btnTheme);
        shadow.appendChild(btnAlarm);
      })();
    `);
  });
}

app.whenReady().then(() => {
    tray = new Tray(iconPath); 
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir MeetPoint', click: () => mainWindow.show() },
        { label: 'Sair Completamente', click: () => {
            app.isQuiting = true;
            app.quit();
        }}
    ]);
    tray.setToolTip('Notificador de Aulas');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow.show());
    createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});