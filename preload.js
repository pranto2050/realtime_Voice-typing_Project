const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion:      () => ipcRenderer.invoke('get-app-version'),
  setOpacity:      (v) => ipcRenderer.send('set-opacity', v),
  setBgColor:      (c) => ipcRenderer.send('set-bg-color', c),
  setAlwaysOnTop:  (b) => ipcRenderer.send('set-always-on-top', b),
  minimize:        ()  => ipcRenderer.send('minimize-window'),
  close:           ()  => ipcRenderer.send('close-window'),
  startVoice:      ()  => ipcRenderer.send('start-voice'),
  stopVoice:       ()  => ipcRenderer.send('stop-voice'),
  pauseVoice:      ()  => ipcRenderer.send('pause-voice'),
  resumeVoice:     ()  => ipcRenderer.send('resume-voice'),
  setLanguage:     (l) => ipcRenderer.send('set-language', l),
  onVoiceData:     (cb) => ipcRenderer.on('voice-data', (e,d) => cb(d)),
  onToggleVoice:   (cb) => ipcRenderer.on('toggle-voice', cb),
  onPermStatus:    (cb) => ipcRenderer.on('permission-status', (e,d) => cb(d)),
  openExternal:    (url) => shell.openExternal(url)
});
