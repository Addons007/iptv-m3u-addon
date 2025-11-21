// api/config.js
let currentUrl = null;

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const body = [];
            req.on('data', chunk => body.push(chunk));
            req.on('end', () => {
                const data = JSON.parse(Buffer.concat(body).toString());
                currentUrl = data.m3uUrl;
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, url: currentUrl }));
            });
        } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    } else if (req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({ url: currentUrl }));
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
};
