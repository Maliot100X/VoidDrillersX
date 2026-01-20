const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'AIzaSyBusgN3abDuq7Wg9xAII1Aw7YmGvUU0dOs';
const MODEL = 'imagen-3.0-generate-001'; 
// Note: If imagen-3.0-generate-001 is not available, we might need to fallback or fail.
// Common endpoint for AI Studio keys:
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;

const OUTPUT_DIR = path.join(__dirname, 'public');

const tasks = [
    {
        filename: 'icon.png',
        prompt: "Sci-fi logo for VoidDrillersX: neon blue/purple rocket-drill spaceship blasting asteroid with crystal shards. Simple, high-contrast, centered. Transparent background. Vector style, high-res.",
        aspectRatio: "1:1"
    },
    {
        filename: 'splash.png',
        prompt: "Minimal splash for VoidDrillersX: centered neon rocket-drill in space with floating asteroids, purple/blue glow. Dark cosmic background, no text. Clean, square.",
        aspectRatio: "1:1"
    },
    {
        filename: 'og.png',
        prompt: "OG for VoidDrillersX: wide space scene with drilling explosion, neon effects. Bold text 'VoidDrillersX' and 'Drill. Mine. Earn. Rewards.'. High contrast, no small text.",
        aspectRatio: "16:9"
    },
    {
        filename: 'frame.png',
        prompt: "Frame preview for VoidDrillersX: asteroid mining action with spaceship, crystals bursting. Include '#1 Ecommunity 518993.9q TLM'. Minimal UI, safe margins, dark BG.",
        aspectRatio: "16:9"
    },
    {
        filename: 'hero.png',
        prompt: "Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Match overall VoidDrillersX aesthetic.",
        aspectRatio: "16:9"
    },
    {
        filename: 'screenshot1.png',
        prompt: "Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Match overall VoidDrillersX aesthetic. Action shot.",
        aspectRatio: "16:9"
    },
    {
        filename: 'screenshot2.png',
        prompt: "Cinematic in-game mining spaceship drilling asteroids, neon glow, dark cosmic background. Match overall VoidDrillersX aesthetic. Close up details.",
        aspectRatio: "16:9"
    }
];

async function generateImage(task) {
    console.log(`Generating ${task.filename}...`);
    
    const requestBody = JSON.stringify({
        instances: [
            { prompt: task.prompt }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: task.aspectRatio
        }
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestBody.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(ENDPOINT, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const response = JSON.parse(data);
                        // Response structure for Imagen on Vertex/AI Studio might vary.
                        // Typically: { predictions: [ { bytesBase64Encoded: "..." } ] } 
                        // or { predictions: [ "base64..." ] }
                        // Let's inspect or assume standard format.
                        
                        let base64Image = null;
                        
                        if (response.predictions && response.predictions.length > 0) {
                            const pred = response.predictions[0];
                            if (typeof pred === 'string') {
                                base64Image = pred;
                            } else if (pred.bytesBase64Encoded) {
                                base64Image = pred.bytesBase64Encoded;
                            } else if (pred.mimeType && pred.bytesBase64Encoded) {
                                base64Image = pred.bytesBase64Encoded;
                            }
                        }

                        if (base64Image) {
                            const buffer = Buffer.from(base64Image, 'base64');
                            fs.writeFileSync(path.join(OUTPUT_DIR, task.filename), buffer);
                            console.log(`Saved ${task.filename}`);
                            resolve();
                        } else {
                            console.error(`Failed to parse image data for ${task.filename}:`, data.substring(0, 200));
                            reject(new Error('No image data found'));
                        }
                    } catch (e) {
                        console.error(`Error parsing JSON for ${task.filename}:`, e);
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
            await generateImage(task);
        } catch (error) {
            console.error(`Skipping ${task.filename} due to error.`);
        }
    }
}

main();
