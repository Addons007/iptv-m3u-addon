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
  behaviorHints: { configurationRequired: true }
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(() => ({
  metas: [
    {
      id: "sample1",
      type: "tv",
      name: "Sample Channel",
      poster: "https://i.imgur.com/P1f8h3F.png"
    }
  ]
}));

builder.defineStreamHandler(({ id }) => {
  if (id === "sample1") {
    return Promise.resolve({
      streams: [
        {
          title: "Sample Stream",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }
      ]
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