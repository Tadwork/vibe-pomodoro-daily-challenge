const path = require("path");

function resolvePublicFilePath(publicDir, requestUrl) {
  let pathname = String(requestUrl || "/");
  pathname = pathname.split("?")[0].split("#")[0];
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.resolve(publicDir, `.${pathname}`);
  const relativePath = path.relative(publicDir, filePath);
  const isForbidden = relativePath.startsWith("..") || path.isAbsolute(relativePath);

  return {
    filePath,
    isForbidden
  };
}

module.exports = {
  resolvePublicFilePath
};
