const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = '6b039c42-678c-4a0d-923d-3796f9614e68';
const ENDPOINT = 'https://api.sambanova.ai/v1/chat/completions';
const MODEL = 'Llama-4-Maverick-17B-128E-Instruct';

const OUTPUT_DIR = path.join(__dirname, 'public');

const tasks = [
    {
        filename: 'icon.png',
        prompt: "Create an SVG for a sci-fi app icon: neon blue/purple rocket-drill spaceship blasting asteroid with crystal shards. Simple, high-contrast, centered. Transparent background. Vector style. Output ONLY the raw SVG code.",
        width: 512, height: 512
    },
    {
        filename: 'splash.png',
        prompt: "Create an SVG for a splash screen: centered neon rocket-drill in space with floating asteroids, purple/blue glow. Dark cosmic background, no text. Clean, square. Output ONLY the raw SVG code.",
        width: 2000, height: 2000
    },
    {
        filename: 'og.png',
        prompt: "Create an SVG for an OG image: wide space scene with drilling explosion, neon effects. Bold text 'VoidDrillersX'. High contrast. Output ONLY the raw SVG code.",
        width: 1200, height: 630
    },
    {
        filename: 'frame.png',
        prompt: "Create an SVG for a Frame preview: asteroid mining action with spaceship, crystals bursting. Include text '#1 Ecommunity'. Minimal UI, dark BG. Output ONLY the raw SVG code.",
        width: 1200, height: 630
    },
    {
        filename: 'hero.png',
        prompt: "Create an SVG for a hero image: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Output ONLY the raw SVG code.",
        width: 1920, height: 1080
    },
    {
        filename: 'screenshot1.png',
        prompt: "Create an SVG for a screenshot: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Action shot. Output ONLY the raw SVG code.",
        width: 1920, height: 1080
    },
    {
        filename: 'screenshot2.png',
        prompt: "Create an SVG for a screenshot: Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Close up details. Output ONLY the raw SVG code.",
        width: 1920, height: 1080
    }
];

function extractSvg(text) {
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
    return svgMatch ? svgMatch[0] : null;
}

async function generateSvg(task) {
    console.log(`Generating ${task.filename}...`);

    const requestBody = JSON.stringify({
        model: MODEL,
        messages: [
            { role: "system", content: "You are an expert SVG artist. You create high-quality, valid SVG code based on descriptions. Return ONLY the SVG code. Do not include markdown code blocks like ```xml or ```svg. Just the raw <svg>...</svg>." },
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

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const response = JSON.parse(data);
                        const content = response.choices[0].message.content;
                        
                        let svg = extractSvg(content);
                        if (!svg) {
                            // If no SVG tag found, maybe it's just the content? 
                            // Or the model failed to follow "ONLY SVG".
                            // Let's try to wrap it if it looks like XML content but missing tags, 
                            // or just save what we got if it starts with <
                            if (content.trim().startsWith('<')) {
                                svg = content;
                            } else {
                                // Fallback: Create a placeholder with the text
                                svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${task.width}" height="${task.height}" viewBox="0 0 ${task.width} ${task.height}">
                                    <rect width="100%" height="100%" fill="#0B0E17"/>
                                    <text x="50%" y="50%" fill="red" font-size="20" text-anchor="middle">Failed to generate SVG: ${task.filename}</text>
                                    <!-- Raw output: ${content.replace(/-->/g, '')} -->
                                </svg>`;
                                console.warn(`Could not extract SVG for ${task.filename}, using fallback.`);
                            }
                        }
                        
                        // Ensure width/height attributes are correct in the SVG tag
                        if (!svg.includes(`width="${task.width}"`)) {
                             svg = svg.replace('<svg', `<svg width="${task.width}" height="${task.height}"`);
                        }

                        fs.writeFileSync(path.join(OUTPUT_DIR, task.filename), svg);
                        console.log(`Saved ${task.filename}`);
                        resolve();
                    } catch (e) {
                        console.error(`Error parsing JSON for ${task.filename}:`, e);
                        console.error('Raw data:', data);
                        reject(e);
                    }
                } else {
                    console.error(`API Request failed for ${task.filename} with status ${res.statusCode}:`, data);
                    reject(new Error(`API Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error for ${task.filename}:`, e);
            reject(e);
        });

        req.write(requestBody);
        req.end();
    });
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const task of tasks) {
        try {
            await generateSvg(task);
            // Add a small delay to respect rate limits
            await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            console.error(`Skipping ${task.filename} due to error.`);
        }
    }
}

main();
