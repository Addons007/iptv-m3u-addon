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
