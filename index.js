const { addonBuilder, getRouter } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

// --- M3U Parser ---
function parseM3U(m3uContent) {
  const lines = m3uContent.split("\n");
  const items = [];
  let current = {};

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.*)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      current.name = nameMatch ? nameMatch[1] : "Unnamed Channel";
      current.attributes = {
        "tvg-logo": logoMatch ? sanitizeLogo(logoMatch[1]) : ""
      };
    } else if (line && !line.startsWith("#")) {
      current.url = line;
      items.push(current);
      current = {};
    }
  }

  return { items };
}

function sanitizeLogo(logoUrl) {
  // Replace unstable logos with a default PNG if needed
  if (!logoUrl || !logoUrl.endsWith(".png")) {
    return "https://i.imgur.com/P1f8h3F.png"; // fallback logo
  }
  return logoUrl;
}

// --- Manifest ---
const manifest = {
  id: "org.iptv.m3u",
  version: "1.0.0",
  name: "IPVV/M3U",
  description: "Custom IPTV addon supporting personal M3U or TXT playlists via file upload or URL",
  logo: "https://i.imgur.com/9z4ZQ0T.png", // ← your addon icon
  types: ["tv"],
  resources: ["catalog", "stream"],
  catalogs: [
    {
      type: "tv",
      id: "iptv",
      name: "IPTV Channels",
      extra: [
        {
          name: "m3uUrl",
          isRequired: true,
          isUserVisible: true,
          type: "text",
          defaultValue: "",
          description: "Enter your M3U playlist URL"
        }
      ]
    }
  ],
  behaviorHints: { configurationRequired: true }
};

const builder = new addonBuilder(manifest);

// --- Catalog Handler ---
builder.defineCatalogHandler(async ({ config }) => {
  const m3uUrl = config.m3uUrl;
  if (!m3uUrl) {
    return {
      metas: [{
        id: "ipvv_instruction",
        type: "tv",
        name: "Configuration Required",
        poster: "https://i.imgur.com/KqW8o3J.gif",
        description: "Please click the gear icon (⚙️) to enter your M3U playlist URL."
      }]
    };
  }

  try {
    const response = await fetch(m3uUrl);
    const m3uContent = await response.text();
    const playlist = parseM3U(m3uContent);

    const metas = playlist.items.map((channel, index) => ({
      id: `ipvv_${index}`,
      type: "tv",
      name: channel.name || `Channel ${index + 1}`,
      poster: channel.attributes["tvg-logo"] || "https://i.imgur.com/P1f8h3F.png"
    }));

    return { metas };
  } catch (error) {
    console.error("Catalog Error:", error);
    return {
      metas: [{
        id: "ipvv_error",
        type: "tv",
        name: "Error Loading Playlist",
        poster: "https://i.imgur.com/KqW8o3J.gif",
        description: `Could not load or parse playlist. Error: ${error.message}`
      }]
    };
  }
});

// --- Stream Handler ---
builder.defineStreamHandler(async ({ id, config }) => {
  const m3uUrl = config.m3uUrl;
  const channelIndex = parseInt(id.replace("ipvv_", ""));

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
          title: channel.name || "Live Stream",
          name: channel.name || "Live Stream"
        }]
      };
    }
  } catch (error) {
    console.error("Stream Error:", error);
  }

  return { streams: [] };
});

// --- Vercel Export ---
const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

module.exports = (req, res) => {
  router(req, res, () => {
    res.statusCode = 404;
    res.end("Not Found");
  });
};
