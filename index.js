const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const fetch = require('node-fetch');

// --- 1. ADDON METADATA ---
const manifest = {
    id: 'org.iptv.m3u',
    version: '1.0.0',
    name: 'IPTV M3U Addon',
    description: 'Stream IPTV channels from an M3U playlist',
    types: ['tv'],
    catalogs: [
        {
            type: 'tv',
            id: 'iptv',
            name: 'IPTV Channels',
            extra: [{ name: 'm3uUrl', isRequired: true }]
        }
    ],
    resources: ['catalog', 'stream'],
    behaviorHints: { configurationRequired: true }
};

// --- 2. ADDON BUILDER ---
const builder = new addonBuilder(manifest);

// --- 3. Catalog Handler ---
builder.defineCatalogHandler(async ({ config }) => {
    const m3uUrl = config.m3uUrl;
    if (!m3uUrl) {
        return {
            metas: [{
                id: 'ipvv_instruction',
                type: 'tv',
                name: 'Configuration Required',
                poster: 'https://i.imgur.com/KqW8o3J.gif',
                description: 'Please click the gear icon (⚙️) to enter your M3U playlist URL.'
            }]
        };
    }

    try {
        const response = await fetch(m3uUrl);
        const m3uContent = await response.text();
        const playlist = parseM3U(m3uContent); // You must implement this function

        const metas = playlist.items.map((channel, index) => ({
            id: `ipvv_${index}`,
            type: 'tv',
            name: channel.name || `Channel ${index + 1}`,
            poster: channel.attributes['tvg-logo'] || 'https://i.imgur.com/P1f8h3F.png'
        }));

        return { metas };
    } catch (error) {
        console.error("Catalog Error:", error);
        return {
            metas: [{
                id: 'ipvv_error',
                type: 'tv',
                name: 'Error Loading Playlist',
                poster: 'https://i.imgur.com/KqW8o3J.gif',
                description: `Could not load or parse playlist. Error: ${error.message}`
            }]
        };
    }
});

// --- 4. Stream Handler ---
builder.defineStreamHandler(async ({ id, config }) => {
    const m3uUrl = config.m3uUrl;
    const channelIndex = parseInt(id.replace('ipvv_', ''));

    if (!m3uUrl || isNaN(channelIndex)) return { streams: [] };

    try {
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
        console.error("Stream Error:", error);
    }

    return { streams: [] };
});

// --- 5. VERCEL EXPORT ---
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

module.exports = (req, res) => {
    router(req, res, () => {
        res.statusCode = 404;
        res.end('Not Found');
    });
};
