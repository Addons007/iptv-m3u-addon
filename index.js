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

export default function handler(req, res) {
  const interface = builder.getInterface();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(interface));
}
