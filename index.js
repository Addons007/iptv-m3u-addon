const { addonBuilder } = require("stremio-addon-sdk");
const manifest = {
  id: "org.addons007.iptv",
  version: "1.0.0",
  name: "IPTV M3U Addon",
  description: "Stremio addon for custom IPTV M3U playlists",
  types: ["tv"],
  resources: ["stream"],
  behaviorHints: {
    configurationRequired: true
  },
  logo: "https://images.weserv.nl/?url=raw.githubusercontent.com/Addons007/iptv-m3u-addon/main/logo.png"
};

const builder = new addonBuilder(manifest);

const playlistUrl = "https://raw.githubusercontent.com/Addons007/iptv-m3u-addon/main/playlist.txt";

function parseM3U(data) {
  const lines = data.split("\n");
  const streams = [];
  let current = {};
  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.*)/);
      const idMatch = line.match(/tvg-id="(.*?)"/);
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      current = {
        name: nameMatch ? nameMatch[1] : "Unknown",
        id: idMatch ? idMatch[1] : nameMatch ? nameMatch[1] : "Unknown",
        logo: logoMatch ? logoMatch[1] : null
      };
    } else if (line.startsWith("http")) {
      streams.push({
        name: current.name,
        description: "Live IPTV Stream",
        url: line,
        id: current.id,
        title: current.name,
        logo: current.logo
      });
    }
  }
  return streams;
}

builder.defineStreamHandler(async ({ type, id }) => {
  if (type !== "tv") return Promise.resolve({ streams: [] });
  const res = await fetch(playlistUrl);
  const text = await res.text();
  const streams = parseM3U(text);
  const matched = streams.filter(s =>
    s.id === id || s.name.toLowerCase() === id.toLowerCase()
  );
  return Promise.resolve({ streams: matched });
});

module.exports = builder.getInterface();
