const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = '6b039c42-678c-4a0d-923d-3796f9614e68';
const ENDPOINT = 'https://api.sambanova.ai/v1/chat/completions';
const MODEL = 'Llama-4-Maverick-17B-128E-Instruct';

const OUTPUT_DIR = path.join(__dirname, 'public');

const tasks = [
    {
        filename: 'icon.png',
        prompt: "Draw a sci-fi app icon: neon blue/purple rocket-drill spaceship blasting asteroid. Simple, high-contrast, centered. Dark background. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 512, height: 512
    },
    {
        filename: 'splash.png',
        prompt: "Draw a splash screen: centered neon rocket-drill in space with floating asteroids, purple/blue glow. Dark cosmic background. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 2000, height: 2000
    },
    {
        filename: 'og.png',
        prompt: "Draw an OG image: wide space scene with drilling explosion, neon effects. Bold text 'VoidDrillersX'. High contrast. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 1200, height: 630
    },
    {
        filename: 'frame.png',
        prompt: "Draw a Frame preview: asteroid mining action with spaceship, crystals bursting. Text '#1 Ecommunity'. Dark BG. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 1200, height: 630
    },
    {
        filename: 'hero.png',
        prompt: "Draw a hero image: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 1920, height: 1080
    },
    {
        filename: 'screenshot1.png',
        prompt: "Draw a screenshot: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Action shot. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 1920, height: 1080
    },
    {
        filename: 'screenshot2.png',
        prompt: "Draw a screenshot: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Close up. Return ONLY Javascript code for a function 'draw(ctx, width, height)' using Canvas API.",
        width: 1920, height: 1080
    }
];

function extractCode(text) {
    // Try to extract content inside ```javascript or ``` blocks
    const match = text.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
    if (match) return match[1];
    // If no blocks, assume the whole text is code if it contains "function draw"
    if (text.includes("function draw")) return text;
    return null;
}

async function getDrawCode(task) {
    console.log(`Getting code for ${task.filename}...`);

    const requestBody = JSON.stringify({
        model: MODEL,
        messages: [
            { role: "system", content: "You are an expert Canvas API developer. You write Javascript code to draw on a HTML5 Canvas. Output ONLY the code for a function named `draw(ctx, width, height)`. Do not include require statements. Use `ctx` methods like `fillStyle`, `fillRect`, `beginPath`, `arc`, `moveTo`, `lineTo`, `stroke`, `fillText`. Use gradients. Make it look sci-fi and neon." },
            { role: "user", content: `${task.prompt} Dimensions: ${task.width}x${task.height}.` }
        ],
        stream: false,
        temperature: 0.7
    });

    const url = new URL(ENDPOINT);
    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const response = JSON.parse(data);
                        const content = response.choices[0].message.content;
                        resolve(extractCode(content));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`API Status ${res.statusCode}`));
                }
            });
        });
        req.write(requestBody);
        req.end();
    });
}

async function generateImage(task) {
    try {
        const code = await getDrawCode(task);
        if (!code) throw new Error("No code generated");

        const canvas = createCanvas(task.width, task.height);
        const ctx = canvas.getContext('2d');

        // Create a wrapper function to execute the generated code
        // We pass 'ctx', 'width', 'height' to the evaluated code
        const drawFunction = new Function('ctx', 'width', 'height', code + '\n if(typeof draw === "function") draw(ctx, width, height);');
        
        drawFunction(ctx, task.width, task.height);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(OUTPUT_DIR, task.filename), buffer);
        console.log(`Saved ${task.filename}`);
    } catch (e) {
        console.error(`Failed to generate ${task.filename}:`, e);
        // Fallback: Simple gradient
        const canvas = createCanvas(task.width, task.height);
        const ctx = canvas.getContext('2d');
        const grd = ctx.createLinearGradient(0, 0, task.width, task.height);
        grd.addColorStop(0, "#0B0E17");
        grd.addColorStop(1, "#1a0b2e");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, task.width, task.height);
        ctx.fillStyle = "#00F0FF";
        ctx.font = "30px Arial";
        ctx.fillText(task.filename, 50, 50);
        fs.writeFileSync(path.join(OUTPUT_DIR, task.filename), canvas.toBuffer('image/png'));
        console.log(`Saved fallback for ${task.filename}`);
    }
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const task of tasks) {
        await generateImage(task);
        await new Promise(r => setTimeout(r, 1000));
    }
}

main();
