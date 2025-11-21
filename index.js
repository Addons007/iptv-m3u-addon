const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
  id: "org.addons007.iptv",
  version: "1.0.0",
  name: "IPTV M3U Addon",
  description: "Stream addon for custom IPTV M3U playlists",
  types: ["movie", "series"],
  catalogs: [],
  resources: ["stream"],
  behaviorHints: {
    configurationRequired: false
  }
};

const playlistUrl = "https://raw.githubusercontent.com/Addons007/iptv-m3u-addon/main/playlist.txt";
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
  const res = await fetch(playlistUrl);
  const m3u = await res.text();
  const lines = m3u.split("\n");

  const streams = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const title = lines[i].split(",")[1]?.trim();
      const url = lines[i + 1]?.trim();
      if (title && url && id.toLowerCase().includes(title.toLowerCase())) {
        streams.push({ title, url });
      }
    }
  }

  return Promise.resolve({ streams });
});

module.exports = builder.getInterface();
