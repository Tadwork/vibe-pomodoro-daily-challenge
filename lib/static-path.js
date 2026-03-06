const path = require("path");

function resolvePublicFilePath(publicDir, requestUrl) {
  const pathname = requestUrl === "/" ? "/index.html" : requestUrl;
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
