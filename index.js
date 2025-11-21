// index.js (Your main addon logic file)

const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { parseM3U } = require('@iptv/playlist');

// --- Manifest Definition ---
const manifest = {
    id: 'org.ipvv.m3u.custom',
    version: '1.0.0',
    name: 'IPVV/M3U',
    description: 'Custom IPTV addon supporting personal M3U playlists via URL.',
    
    resources: ['catalog', 'stream', 'config'], 
    types: ['tv'], 
    
    catalogs: [{
        type: 'tv',
        id: 'user_m3u_channels',
        name: 'My IPTV Channels',
        extra: [{ name: 'config' }] 
    }],
    
    idPrefixes: ['ipvv_'],
    
    config: [{
        key: 'm3uUrl',
        type: 'text',
        title: 'Playlist URL',
        required: true,
        default: '',
    }]
};

const builder = new addonBuilder(manifest);

// --- 1. Configuration Handler (Serves config.html) ---
builder.defineConfigurationHandler(() => {
    // Reads the static HTML file from the current directory
    const htmlPath = path.join(__dirname, 'config.html');
    
    try {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        return Promise.resolve({
            html: htmlContent
        });
    } catch (e) {
        // Fallback error message if config.html is missing
        return Promise.resolve({
            html: '<h1>Error: config.html not found!</h1><p>Please ensure you have created the config.html file in your project root.</p>'
        });
    }
});

// --- 2. Catalog Handler (Fetches and Parses M3U) ---
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
        if (!response.ok) {
            throw new Error(`Failed to fetch M3U: ${response.statusText}`);
        }
        const m3uContent = await response.text();
        const playlist = parseM3U(m3uContent);
        
        const metas = playlist.items.map((channel, index) => {
            const attributes = channel.attributes || {};
            const logo = attributes['tvg-logo'] || null;
            const title = channel.name || `Channel ${index + 1}`;

            return {
                id: `ipvv_${index}`,
                type: 'tv',
                name: title,
                poster: logo || 'https://i.imgur.com/P1f8h3F.png',
                background: attributes['group-title'] ? `Group: ${attributes['group-title']}` : null,
            };
        });

        return { metas };

    } catch (error) {
        console.error("M3U Processing Error:", error);
        return { metas: [{
            id: 'ipvv_error',
            type: 'tv',
            name: 'Error Loading Playlist',
            poster: 'https://i.imgur.com/KqW8o3J.gif',
            description: `Could not load or parse playlist from ${m3uUrl}. Error: ${error.message}`,
        }]};
    }
});

// --- 3. Stream Handler (Provides the Playable Link) ---
builder.defineStreamHandler(async ({ id, type, config }) => {
    const m3uUrl = config.m3uUrl;
    const channelIndex = parseInt(id.replace('ipvv_', ''));

    if (!m3uUrl || isNaN(channelIndex)) {
        return { streams: [] };
    }

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

// --- VERCEL EXPORT (The crucial part for Vercel deployment) ---
// This handles the serverless routing.

const addonInterface = builder.getAddon();
const router = getRouter(addonInterface);

// This exports a Vercel-compatible function handler that handles all HTTP requests
module.exports = (req, res) => {
    // The router handles the Stremio requests (manifest, catalog, stream, config)
    router(req, res, () => {
        // Fallback for requests that don't match an addon route
        res.statusCode = 404;
        res.end('Not Found');
    });
};
