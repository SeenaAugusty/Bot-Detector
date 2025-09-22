let buffer = [];
let session = null;

// Load ONNX model (LSTM + FC1 for JS inference)
async function loadModel() {
    session = await ort.InferenceSession.create('/wp-content/plugins/bot-detector/static/js_model.onnx');
}

// Min-Max Normalization
function normalize(seq) {
    let normalized = [];
    for (let i = 0; i < 3; i++) {
        const col = seq.map(row => row[i]);
        const min = Math.min(...col);
        const max = Math.max(...col);
        normalized.push(col.map(val => (val - min) / (max - min + 1e-8)));
    }

    let res = [];
    for (let j = 0; j < seq.length; j++) {
        res.push([normalized[0][j], normalized[1][j], normalized[2][j]]);
    }
    return res;
}

// Run model (forward pass) in browser
async function runModel(seq) {
    const tensor = new ort.Tensor('float32', seq.flat(), [1, 20, 3]);
    const feeds = { input: tensor };
    const results = await session.run(feeds);
    return Array.from(results.output.data);
}

// Logistic regression classifier in JS
function classify(latent) {
    const w1 = 2.28;
    const w2 = -1.84;
    const b = -5.28;
    const x1 = latent[0];
    const x2 = latent[1];
    const z = w1 * x1 + w2 * x2 + b;
    const prob = 1 / (1 + Math.exp(-z));
    return prob < 0.5 ? "human" : "bot";
}

function showBanner(text, isBot) {
    let banner = document.getElementById('bot-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'bot-banner';
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.height = '80px'; // fixed height for layout
        banner.style.padding = '10px 20px';
        banner.style.display = 'flex';
        banner.style.alignItems = 'flex-end'; // align text to bottom
        banner.style.justifyContent = 'center';
        banner.style.fontSize = '20px';
        banner.style.fontWeight = 'bold';
        banner.style.fontFamily = 'Arial, sans-serif';
        banner.style.zIndex = '9999';
        banner.style.transition = 'opacity 0.5s ease';
        banner.style.opacity = '0';
        banner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        document.body.appendChild(banner);
    }

    banner.textContent = text;
    banner.style.backgroundColor = isBot ? '#ff4d4d' : '#4CAF50'; // bright red or green
    banner.style.color = '#ffffff'; // white text for contrast
    banner.style.opacity = '1';
    banner.style.display = 'flex';

    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }, 10000);
}

// Mouse Tracking Function
let lastTimestamp = null;
function trackMouse(e) {
    const now = performance.now();
    if (lastTimestamp === null) {
        lastTimestamp = now;
    }

    const dt = now - lastTimestamp;
    lastTimestamp = now;

    buffer.push([e.clientX, e.clientY, dt]);

    if (buffer.length === 20) {
        const normSeq = normalize(buffer);
        runModel(normSeq).then(latent => {
            const result = classify(latent);
            console.log(result === "human" ? "✅ You are classified as HUMAN." : "⚠️ You are classified as a BOT.");
            showBanner(
                result === "human" ? "✅ You are classified as HUMAN." : "⚠️ You are classified as a BOT.",
                result === "bot"
            );
        });
        buffer = [];
    }
}

// On window load, load model & start capturing mouse
window.onload = async function () {
    await loadModel();
    window.addEventListener('mousemove', trackMouse);
};
