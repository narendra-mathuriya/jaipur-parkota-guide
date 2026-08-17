const rawBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";

export const siteBasePath =
  rawBasePath && rawBasePath !== "/"
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

export function withBasePath(path: string) {
  if (!siteBasePath || !path.startsWith("/")) {
    return path;
  }

  return `${siteBasePath}${path}`;
}

export const assetPath = withBasePath;
