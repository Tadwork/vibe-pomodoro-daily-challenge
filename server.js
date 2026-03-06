const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const safePath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath);
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Pomodoro app running at http://localhost:${port}`);
});
