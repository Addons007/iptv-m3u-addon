const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
  id: "org.addons007.iptv",
  version: "1.0.0",
  name: "IPTV M3U Addon",
  description: "Stream addon for custom IPTV M3U playlists",
  types: ["movie", "series"],
  resources: ["stream"],
  catalogs: [],
  behaviorHints: {
    configurationRequired: false
  }
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ id }) => {
  return Promise.resolve({
    streams: [
      {
        title: "Test Stream",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      }
    ]
  });
});

const addonInterface = builder.getInterface();

module.exports = async (req, res) => {
  const pathname = req.url.split("?")[0];

  if (pathname === "/manifest.json") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(addonInterface.manifest));
  } else if (pathname === "/stream.json") {
    const { id } = req.query;
    const result = await addonInterface.get("stream", { id });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
};
