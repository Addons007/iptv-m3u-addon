const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
  id: "org.addons007.iptv",
  version: "1.0.0",
  name: "IPTV M3U Addon",
  description: "Stream addon for custom IPTV M3U playlists",
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
      streams: [{ title: "Channel 1 Stream", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }]
    });
  }
  if (id === "channel2") {
    return Promise.resolve({
      streams: [{ title: "Channel 2 Stream", url: "https://test-streams.mux.dev/test_001/stream.m3u8" }]
    });
  }
  return Promise.resolve({ streams: [] });
});

const addonInterface = builder.getInterface();

module.exports = async (req, res) => {
  const pathname = req.url.split("?")[0];

  if (pathname === "/manifest.json") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(addonInterface.manifest));
  } else if (pathname === "/catalog/tv/iptv.json") {
    const result = await addonInterface.get("catalog", { type: "tv", id: "iptv" });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } else if (pathname === "/stream/channel1.json") {
    const result = await addonInterface.get("stream", { id: "channel1" });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } else if (pathname === "/stream/channel2.json") {
    const result = await addonInterface.get("stream", { id: "channel2" });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
};
