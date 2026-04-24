const opacityRange = document.getElementById('opacity-range');
const alwaysOnTopCheckbox = document.getElementById('always-on-top');
const colorBtns = document.querySelectorAll('.color-btn');

opacityRange.addEventListener('input', (e) => {
    window.electronAPI.setOpacity(e.target.value);
});

alwaysOnTopCheckbox.addEventListener('change', (e) => {
    window.electronAPI.setAlwaysOnTop(e.target.checked);
});

colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        
        colorBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        document.documentElement.style.setProperty('--bg-color', color);
    });
});
