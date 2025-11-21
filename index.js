{
  "id": "org.andrei.ipvv",
  "version": "1.0.0",
  "name": "IPVV/M3U Playlist Addon",
  "description": "Custom IPTV addon with user playlist upload or URL",
  "resources": ["channel"],
  "types": ["tv"],
  "catalogs": [],
  "configurable": true,
  "config": [
    {
      "key": "playlistUrl",
      "type": "text",
      "title": "Playlist URL",
      "required": false
    },
    {
      "key": "playlistFile",
      "type": "file",
      "title": "Upload M3U File",
      "required": false
    }
  ]
}
