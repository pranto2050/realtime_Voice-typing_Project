const canvas = document.getElementById('waveform-canvas');
const ctx = canvas.getContext('2d');

let animationId;
let isAnimating = false;
const historySize = 30;
let levelHistory = new Array(historySize).fill(0);

// Web Audio API variables
let audioContext;
let analyser;
let microphone;
let dataArray;

function initWaveform() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawWaveform();
}

async function startAudioCapture() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            microphone = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            microphone.connect(analyser);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    } catch (err) {
        console.error('Error accessing microphone for visualizer:', err);
    }
}

function stopAudioCapture() {
    if (audioContext && audioContext.state === 'running') {
        audioContext.suspend();
    }
}

function updateWaveform(level) {
    // Left for compatibility with IPC, but we use real-time Web Audio now
}

function drawWaveform() {
    if (!isAnimating) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'rgba(137, 180, 250, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let currentVol = 0;
    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        // Use lower frequencies for speech volume
        const len = Math.floor(dataArray.length / 2); 
        for (let i = 0; i < len; i++) {
            sum += dataArray[i];
        }
        currentVol = sum / len / 255;
    }

    levelHistory.pop();
    let visualLevel = currentVol * 2.5; // Boost the visual volume slightly
    if (visualLevel > 1) visualLevel = 1;
    
    // Smooth the visual level
    const lastLevel = levelHistory[0] || 0;
    visualLevel = lastLevel + (visualLevel - lastLevel) * 0.4;
    
    levelHistory.unshift(visualLevel);

    const centerY = canvas.height / 2;
    const centerX = canvas.width / 2;
    const barWidth = 4;
    const spacing = 4;
    
    ctx.fillStyle = '#89b4fa';
    
    for (let i = 0; i < historySize; i++) {
        let height = Math.max(2, levelHistory[i] * canvas.height * 0.8);
        
        // Right side
        ctx.fillRect(centerX + (i * (barWidth + spacing)), centerY - height / 2, barWidth, height);
        // Left side
        if (i !== 0) {
            ctx.fillRect(centerX - (i * (barWidth + spacing)), centerY - height / 2, barWidth, height);
        }
    }
    
    animationId = requestAnimationFrame(drawWaveform);
}

function startWaveform() {
    isAnimating = true;
    startAudioCapture();
    drawWaveform();
}

function stopWaveform() {
    isAnimating = false;
    stopAudioCapture();
    if (animationId) cancelAnimationFrame(animationId);
    levelHistory.fill(0);
    drawWaveform();
}

window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    if (!isAnimating) drawWaveform();
});

initWaveform();
