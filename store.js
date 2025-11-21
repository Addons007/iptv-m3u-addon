// store.js
let m3uUrl = null;

function setUrl(url) {
    m3uUrl = url;
}

function getUrl() {
    return m3uUrl;
}

module.exports = { setUrl, getUrl };
