let isListening = false;
let isPaused = false;

// DOM Elements
const micBtn = document.getElementById('mic-btn');
const micPulse = document.getElementById('mic-pulse');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const transcriptPreview = document.getElementById('transcript-preview');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const navMain = document.getElementById('nav-main');
const navSettings = document.getElementById('nav-settings');
const navAbout = document.getElementById('nav-about');
const mainView = document.getElementById('main-view');
const settingsPanel = document.getElementById('settings-panel');
const aboutPanel = document.getElementById('about-panel');
const mainLangSelect = document.getElementById('main-lang-select');

// Main Page Language Switcher
mainLangSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    window.electronAPI.setLanguage(lang);
});

// Window Controls
minimizeBtn.addEventListener('click', () => window.electronAPI.minimize());
closeBtn.addEventListener('click', () => window.electronAPI.close());

// Navigation
navMain.addEventListener('click', () => {
    navMain.classList.add('active');
    navSettings.classList.remove('active');
    navAbout.classList.remove('active');
    mainView.classList.add('active');
    settingsPanel.classList.remove('active');
    aboutPanel.classList.remove('active');
});

navSettings.addEventListener('click', () => {
    navSettings.classList.add('active');
    navMain.classList.remove('active');
    navAbout.classList.remove('active');
    settingsPanel.classList.add('active');
    mainView.classList.remove('active');
    aboutPanel.classList.remove('active');
});

navAbout.addEventListener('click', () => {
    navAbout.classList.add('active');
    navMain.classList.remove('active');
    navSettings.classList.remove('active');
    aboutPanel.classList.add('active');
    mainView.classList.remove('active');
    settingsPanel.classList.remove('active');
});

// External links for social
document.querySelectorAll('.social-icon, .contact-btn').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const url = el.getAttribute('data-url');
        if (url) window.electronAPI.openExternal(url);
    });
});

// Mic Toggle
micBtn.addEventListener('click', toggleListening);

function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    isListening = true;
    isPaused = false;
    window.electronAPI.startVoice();
    
    micPulse.classList.add('animating');
    micBtn.style.background = 'linear-gradient(135deg, var(--success-color), #89dceb)';
    statusDot.className = 'status-dot active';
    statusText.innerText = 'Listening...';
    transcriptPreview.innerText = 'Listening for speech...';
    
    if (typeof startWaveform === 'function') startWaveform();
}

function stopListening() {
    isListening = false;
    isPaused = false;
    window.electronAPI.stopVoice();
    
    micPulse.classList.remove('animating');
    micBtn.style.background = 'linear-gradient(135deg, var(--accent-color), #cba6f7)';
    statusDot.className = 'status-dot stopped';
    statusText.innerText = 'Stopped';
    transcriptPreview.innerText = 'Ready to type...';
    
    if (typeof stopWaveform === 'function') stopWaveform();
}

// IPC Events
window.electronAPI.onToggleVoice(() => {
    toggleListening();
});

window.electronAPI.onVoiceData((data) => {
    if (data.type === 'transcript') {
        transcriptPreview.innerText = `"${data.text}"`;
    } else if (data.type === 'status') {
        if (data.status === 'listening') {
            statusText.innerText = 'Listening...';
        } else if (data.status === 'typing') {
            statusText.innerText = 'Typing...';
        } else if (data.status === 'error') {
            transcriptPreview.innerText = `Error: ${data.message}`;
            stopListening();
        }
    } else if (data.type === 'audio_level' && typeof updateWaveform === 'function') {
        updateWaveform(data.level);
    }
});

// App Version
window.electronAPI.getVersion().then(version => {
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.innerText = `Version ${version}`;
});

// Permission status (macOS)
window.electronAPI.onPermStatus((status) => {
    if (status !== 'granted' && status !== 'not-determined') {
        transcriptPreview.innerText = `Microphone permission: ${status}. Please grant in settings.`;
    }
});
