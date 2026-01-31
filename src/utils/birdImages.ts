// Shared bird image fetching utility with caching

// Image URL cache
const imageCache = new Map<string, string | null>();
// Image dimensions cache
const dimensionsCache = new Map<string, { width: number; height: number }>();
const pendingRequests = new Map<string, Promise<string | null>>();

function toWikipediaCase(name: string): string {
  return name
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(" ");
}

async function fetchWikipediaImage(name: string): Promise<string | null> {
  const wikiName = toWikipediaCase(name);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiName)}&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=400&redirects=1&origin=*`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    return pageId !== "-1" ? pages[pageId]?.thumbnail?.source || null : null;
  } catch {
    return null;
  }
}

export function getCacheKey(speciesName: string, scientificName?: string | null): string {
  return `${scientificName || ""}|${speciesName}`;
}

export function getCachedImageUrl(speciesName: string, scientificName?: string | null): string | null | undefined {
  const cacheKey = getCacheKey(speciesName, scientificName);
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  return undefined; // undefined means not cached, null means cached as "no image"
}

export function getCachedDimensions(speciesName: string, scientificName?: string | null): { width: number; height: number } | undefined {
  const cacheKey = getCacheKey(speciesName, scientificName);
  return dimensionsCache.get(cacheKey);
}

export function cacheDimensions(speciesName: string, scientificName: string | null | undefined, dimensions: { width: number; height: number }): void {
  const cacheKey = getCacheKey(speciesName, scientificName);
  dimensionsCache.set(cacheKey, dimensions);
}

export async function fetchBirdImage(
  speciesName: string,
  scientificName?: string | null
): Promise<string | null> {
  const cacheKey = getCacheKey(speciesName, scientificName);

  // Return cached result immediately
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Return pending request if one exists (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const names = [scientificName, speciesName].filter(Boolean) as string[];
  const promise = (async () => {
    for (const name of names) {
      const imageUrl = await fetchWikipediaImage(name);
      if (imageUrl) return imageUrl;
    }
    return null;
  })().finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, promise);
  const result = await promise;
  imageCache.set(cacheKey, result);
  return result;
}
