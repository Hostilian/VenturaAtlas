/**
 * Page-aware data client supporting dataset caching, fetch cancellation, and error handling.
 */

const cache = new Map();

export async function fetchDataset(name, rootPath = '.') {
  if (cache.has(name)) {
    return cache.get(name);
  }

  const url = `${rootPath}/data/${name}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} loading ${name}.json`);
    }

    const data = await res.json();
    cache.set(name, data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[DataClient] Error fetching ${name}:`, err);
    return [];
  }
}

export async function fetchPageData(requiredDatasets, rootPath = '.') {
  const results = {};
  await Promise.all(
    requiredDatasets.map(async (name) => {
      results[name] = await fetchDataset(name, rootPath);
    })
  );
  return results;
}
