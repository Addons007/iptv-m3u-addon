// api/index.js

const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const fetch = require('node-fetch');

// --- 1. ADDON METADATA ---
const manifest = {
    id: 'org.iptv.m3u',
    version: '1.0.0',
    name: 'IPTV M3U Addon',
    description: 'Stream IPTV channels from an M3U playlist',
    types: ['tv'],
    catalogs: [],
    resources: ['stream']
};

// --- 2. ADDON BUILDER ---
const builder = new addonBuilder(manifest);

// --- 3. STREAM HANDLER ---
builder.defineStreamHandler(async ({ type, id }) => {
    const m3uUrl = process.env.M3U_URL; // set in Vercel Environment Variables
    const channelIndex = parseInt(id, 10);

    try {
        const response = await fetch(m3uUrl);
        const m3uContent = await response.text();
        const playlist = parseM3U(m3uContent); // implement or import this function

        const channel = playlist.items[channelIndex];
        if (channel && channel.url) {
            return {
                streams: [{
                    url: channel.url,
                    title: channel.name || 'Live Stream',
                    name: channel.name || 'Live Stream'
                }]
            };
        }
    } catch (error) {
        console.error("Stream Fetch Error:", error);
    }

    return { streams: [] };
});

// --- 4. ROUTER EXPORT FOR VERCEL ---
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

module.exports = (req, res) => {
    router(req, res, () => {
        res.statusCode = 404;
        res.end('Not Found');
    });
};
        return Promise.resolve({ html: '<h1>Error: config.html not found!</h1>' });
    }
});

// --- 3. Catalog Handler (Fetches and Parses M3U) ---
builder.defineCatalogHandler(async ({ config }) => {
    const m3uUrl = config.m3uUrl;

    if (!m3uUrl) {
        return { metas: [{
            id: 'ipvv_instruction',
            type: 'tv',
            name: 'Configuration Required',
            poster: 'https://i.imgur.com/KqW8o3J.gif', 
            description: 'Please click the gear icon (⚙️) to enter your M3U playlist URL.',
        }]};
    }

    try {
        const response = await fetch(m3uUrl);
        const m3uContent = await response.text();
        const playlist = parseM3U(m3uContent);
        
        const metas = playlist.items.map((channel, index) => ({
            id: `ipvv_${index}`,
            type: 'tv',
            name: channel.name || `Channel ${index + 1}`,
            poster: channel.attributes['tvg-logo'] || 'https://i.imgur.com/P1f8h3F.png', 
        }));

        return { metas };

    } catch (error) {
        console.error("M3U Processing Error:", error);
        return { metas: [{
            id: 'ipvv_error',
            type: 'tv',
            name: 'Error Loading Playlist',
            poster: 'https://i.imgur.com/KqW8o3J.gif',
            description: `Could not load or parse playlist. Error: ${error.message}`,
        }]};
    }
});

// --- 4. Stream Handler (Provides the Playable Link) ---
builder.defineStreamHandler(async ({ id, type, config }) => {
    const m3uUrl = config.m3uUrl;
    const channelIndex = parseInt(id.replace('ipvv_', ''));

    if (!m3uUrl || isNaN(channelIndex)) { return { streams: [] }; }

    try {
        // Re-fetch and re-parse the M3U to find the stream URL
        const response = await fetch(m3uUrl);
        const m3uContent = await response.text();
        const playlist = parseM3U(m3uContent);
        
        const channel = playlist.items[channelIndex];

        if (channel && channel.url) {
            return { 
                streams: [{ 
                    url: channel.url,
                    title: channel.name || 'Live Stream',
                    name: channel.name || 'Live Stream'
                }] 
            };
        }
        
    } catch (error) {
        console.error("Stream Fetch Error:", error);
    }
    return { streams: [] };
});


// --- 5. VERCEL EXPORT (The crucial part for Vercel deployment) ---

const addonInterface = builder.getAddon();
const router = getRouter(addonInterface);

// This function handles all HTTP requests for the Vercel serverless environment
module.exports = (req, res) => {
    // We hand off the request and response objects to the Stremio Addon Router
    router(req, res, () => {
        // Fallback for unhandled routes
        res.statusCode = 404;
        res.end('Not Found');
    });
};
