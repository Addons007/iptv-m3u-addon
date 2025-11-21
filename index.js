const { addonBuilder, getRouter } = require("stremio-addon-sdk");

const manifest = {
  id: "org.iptv.m3u",
  version: "1.0.0",
  name: "IPTV M3U Addon",
  description: "Stream IPTV channels from an M3U playlist",
  types: ["tv"],
  resources: ["catalog", "stream"],
  catalogs: [
    { type: "tv", id: "iptv", name: "IPTV Channels" }
  ],
  behaviorHints: { configurationRequired: false }
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(() => ({
  metas: [
    { id: "channel1", type: "tv", name: "Sample Channel 1" },
    { id: "channel2", type: "tv", name: "Sample Channel 2" }
  ]
}));

builder.defineStreamHandler(({ id }) => {
  if (id === "channel1") {
    return Promise.resolve({
      streams: [{ title: "Channel 1", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }]
    });
  }
  if (id === "channel2") {
    return Promise.resolve({
      streams: [{ title: "Channel 2", url: "https://test-streams.mux.dev/test_001/stream.m3u8" }]
    });
  }
  return Promise.resolve({ streams: [] });
});

const addonInterface = builder.getInterface();
const router = getRouter(addonInterface);

module.exports = (req, res) => {
  router(req, res, () => {
    res.statusCode = 404;
    res.end("Not Found");
  });
};
