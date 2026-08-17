import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "out");
const reportDir = path.join(rootDir, "lighthouse-reports");
const host = "127.0.0.1";
const requestedPort = Number(process.env.AUDIT_PORT ?? 0);
const shouldBuild = process.env.AUDIT_SKIP_BUILD !== "1" && !process.env.AUDIT_BASE_URL;

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json"],
  [".xml", "application/xml; charset=utf-8"]
]);

let staticServer;
let browser;

try {
  if (shouldBuild) {
    await run("npm", ["run", "build"]);
  }

  const baseUrl = process.env.AUDIT_BASE_URL ?? await startStaticServer();
  const paths = await getAuditPaths();

  await mkdir(reportDir, { recursive: true });
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  for (const routePath of paths) {
    const url = new URL(routePath, baseUrl).toString();
    const page = await browser.newPage();
    const result = await lighthouse(
      url,
      {
        output: ["html", "json"],
        logLevel: "silent"
      },
      undefined,
      page
    );
    await page.close();

    if (!result) {
      throw new Error(`Lighthouse did not return a result for ${url}`);
    }

    const slug = fileSlug(routePath);
    const [htmlReport, jsonReport] = Array.isArray(result.report)
      ? result.report
      : [result.report, JSON.stringify(result.lhr, null, 2)];

    await writeFile(path.join(reportDir, `${slug}.html`), htmlReport);
    await writeFile(path.join(reportDir, `${slug}.json`), jsonReport);

    printScoreSummary(routePath, result.lhr.categories);

    if (result.lhr.runtimeError) {
      throw new Error(
        `Lighthouse runtime error for ${url}: ${result.lhr.runtimeError.message}`
      );
    }
  }

  console.log(`\nReports written to ${path.relative(rootDir, reportDir)}/`);
} finally {
  if (browser) {
    await browser.close();
  }

  if (staticServer) {
    await new Promise((resolve) => staticServer.close(resolve));
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

function startStaticServer() {
  staticServer = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${host}`);
      const filePath = await resolveStaticPath(requestUrl.pathname);

      if (!filePath) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      let body = await readFile(filePath);
      const contentType = contentTypes.get(path.extname(filePath)) ?? "application/octet-stream";
      const headers = {
        "cache-control": cacheControlFor(filePath),
        "content-type": contentType
      };

      if (shouldCompress(filePath, request.headers["accept-encoding"])) {
        body = gzipSync(body);
        headers["content-encoding"] = "gzip";
        headers.vary = "accept-encoding";
      }

      response.writeHead(200, headers);
      response.end(body);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });

  return new Promise((resolve, reject) => {
    staticServer.once("error", reject);
    staticServer.listen(requestedPort, host, () => {
      const address = staticServer.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine static server address"));
        return;
      }

      resolve(`http://${host}:${address.port}/`);
    });
  });
}

function shouldCompress(filePath, acceptEncoding = "") {
  return (
    /\bgzip\b/.test(acceptEncoding) &&
    /\.(?:css|html|js|json|svg|txt|webmanifest|xml)$/.test(filePath)
  );
}

function cacheControlFor(filePath) {
  if (filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)) {
    return "public, max-age=31536000, immutable";
  }

  if (/\.(?:avif|ico|jpe?g|png|svg|webp|woff2)$/.test(filePath)) {
    return "public, max-age=31536000, immutable";
  }

  return "public, max-age=0, must-revalidate";
}

async function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const relativePath = safePath.replace(/^[/\\]+/, "");
  const basePath = path.join(outDir, relativePath);
  const candidates = [];

  if (decodedPath.endsWith("/")) {
    candidates.push(path.join(basePath, "index.html"));
  } else {
    candidates.push(basePath, `${basePath}.html`, path.join(basePath, "index.html"));
  }

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);

    if (!resolved.startsWith(path.resolve(outDir))) {
      continue;
    }

    try {
      const info = await stat(resolved);
      if (info.isFile()) {
        return resolved;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

async function getAuditPaths() {
  if (process.env.AUDIT_PATHS) {
    return process.env.AUDIT_PATHS.split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  try {
    const indexFile = await readFile(path.join(rootDir, "public", "directory-index.json"), "utf8");
    const directoryIndex = JSON.parse(indexFile);
    const firstPlace = directoryIndex.listings?.[0]?.href;
    return firstPlace ? ["/", firstPlace] : ["/"];
  } catch {
    return ["/"];
  }
}

function fileSlug(routePath) {
  const trimmed = routePath.replace(/^\/+|\/+$/g, "");
  return trimmed ? trimmed.replace(/[^a-z0-9]+/gi, "-").toLowerCase() : "home";
}

function printScoreSummary(routePath, categories) {
  const summary = Object.values(categories)
    .map((category) => {
      const score = category.score === null ? "n/a" : Math.round(category.score * 100);
      return `${category.title}: ${score}`;
    })
    .join(" | ");

  console.log(`\n${routePath} -> ${summary}`);
}
