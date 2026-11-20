const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const pages = ["/", "/auth", "/catalog"];
const assetPattern = /(?:href|src)=["'](\/_next\/static\/[^"']+)["']/g;
const results = [];
const assets = new Set();

for (const route of pages) {
  const response = await fetch(`${baseUrl}${route}`);
  const body = await response.text();
  results.push({ route, status: response.status, contentType: response.headers.get("content-type") });
  if (!response.ok) throw new Error(`${route} retornou HTTP ${response.status}`);
  for (const match of body.matchAll(assetPattern)) assets.add(match[1]);
}

if (assets.size === 0) throw new Error("Nenhum asset estático do Next foi referenciado pelo HTML");
for (const asset of assets) {
  const response = await fetch(`${baseUrl}${asset}`);
  results.push({ asset, status: response.status, contentType: response.headers.get("content-type"), bytes: Number(response.headers.get("content-length") || 0) });
  if (!response.ok) throw new Error(`${asset} retornou HTTP ${response.status}`);
}
console.log(JSON.stringify({ baseUrl, pages: pages.length, assets: assets.size, results }, null, 2));