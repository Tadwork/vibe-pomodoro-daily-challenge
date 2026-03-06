const path = require("path");
const { resolvePublicFilePath } = require("../lib/static-path");

describe("resolvePublicFilePath", () => {
  const publicDir = path.join("/tmp", "repo", "public");

  it("serves index for root route", () => {
    const result = resolvePublicFilePath(publicDir, "/");
    expect(result.isForbidden).toBe(false);
    expect(result.filePath).toBe(path.join(publicDir, "index.html"));
  });

  it("allows normal in-root file paths", () => {
    const result = resolvePublicFilePath(publicDir, "/styles.css");
    expect(result.isForbidden).toBe(false);
    expect(result.filePath).toBe(path.join(publicDir, "styles.css"));
  });

  it("ignores query strings in file paths", () => {
    const result = resolvePublicFilePath(publicDir, "/styles.css?v=abc123");
    expect(result.isForbidden).toBe(false);
    expect(result.filePath).toBe(path.join(publicDir, "styles.css"));
  });

  it("blocks traversal attempts escaping the public directory", () => {
    const result = resolvePublicFilePath(publicDir, "/../publicity/secret.txt");
    expect(result.isForbidden).toBe(true);
  });

  it("blocks deep traversal attempts", () => {
    const result = resolvePublicFilePath(publicDir, "/assets/../../secrets.txt");
    expect(result.isForbidden).toBe(true);
  });
});
