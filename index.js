const { addonBuilder, getRouter } = require("stremio-addon-sdk");

const manifest = {
  id: "org.iptv.m3u",
  version: "1.0.0",
  name: "IPVV/M3U",
  description: "Custom IPTV addon supporting personal M3U or TXT playlists via file upload or URL",
  logo: "https://i.imgur.com/9z4ZQ0T.png",
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
  behaviorHints: {
    configurationRequired: true
  }
};

const builder = new addonBuilder(manifest);

// --- Catalog Handler (minimal test version) ---
builder.defineCatalogHandler(({ config }) => {
  const m3uUrl = config.m3uUrl;
  if (!m3uUrl) {
    return {
      metas: [{
        id: "config_needed",
        type: "tv",
        name: "Configuration Required",
        poster: "https://i.imgur.com/KqW8o3J.gif",
        description: "Click the gear icon (⚙️) to enter your M3U playlist URL."
      }]
    };
  }

  return {
    metas: [{
      id: "sample_channel",
      type: "tv",
      name: "Sample Channel",
      poster: "https://i.imgur.com/P1f8h3F.png"
    }]
  };
});

// --- Stream Handler (minimal test version) ---
builder.defineStreamHandler(({ id }) => {
  if (id === "sample_channel") {
    return Promise.resolve({
      streams: [{
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        title: "Sample Stream"
      }]
    });
  }
  return Promise.resolve({ streams: [] });
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
