const canvas = document.getElementById('waveform-canvas');
const ctx = canvas.getContext('2d');

let animationId;
let isAnimating = false;
let currentLevel = 0;
const historySize = 30;
let levelHistory = new Array(historySize).fill(0);

function initWaveform() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawWaveform();
}

function updateWaveform(level) {
    currentLevel = level;
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
    
    levelHistory.pop();
    let visualLevel = currentLevel * 1.5;
    if (visualLevel > 1) visualLevel = 1;
    levelHistory.unshift(visualLevel);

    const centerY = canvas.height / 2;
    const centerX = canvas.width / 2;
    const barWidth = 4;
    const spacing = 4;
    
    ctx.fillStyle = '#89b4fa';
    
    for (let i = 0; i < historySize; i++) {
        const height = Math.max(2, (levelHistory[i] * canvas.height * 0.8) * (0.8 + Math.random() * 0.4)); 
        
        // Right side
        ctx.fillRect(centerX + (i * (barWidth + spacing)), centerY - height / 2, barWidth, height);
        // Left side
        if (i !== 0) {
            ctx.fillRect(centerX - (i * (barWidth + spacing)), centerY - height / 2, barWidth, height);
        }
    }
    
    currentLevel = Math.max(0, currentLevel - 0.04);
    
    animationId = requestAnimationFrame(drawWaveform);
}

function startWaveform() {
    isAnimating = true;
    drawWaveform();
}

function stopWaveform() {
    isAnimating = false;
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
