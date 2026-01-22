export interface EBirdSpecies {
  speciesCode: string;
  comName: string;
  sciName: string;
}

const EBIRD_API_KEY = process.env.EXPO_PUBLIC_EBIRD_API_KEY;
const EBIRD_API_BASE = "https://api.ebird.org/v2";

export async function searchSpecies(query: string): Promise<EBirdSpecies[]> {
  if (!query || query.length < 2) {
    return [];
  }

  if (!EBIRD_API_KEY) {
    console.error("eBird API key not configured");
    return [];
  }

  try {
    // Use eBird taxonomy endpoint to search for species
    const response = await fetch(
      `${EBIRD_API_BASE}/ref/taxonomy/ebird?fmt=json&cat=species`,
      {
        headers: {
          "X-eBirdApiToken": EBIRD_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch species from eBird");
    }

    const allSpecies: Array<{
      speciesCode: string;
      comName: string;
      sciName: string;
    }> = await response.json();

    // Filter species by query (case-insensitive match on common or scientific name)
    const queryLower = query.toLowerCase();
    const filtered = allSpecies
      .filter(
        (species) =>
          species.comName.toLowerCase().includes(queryLower) ||
          species.sciName.toLowerCase().includes(queryLower)
      )
      .slice(0, 20); // Limit results

    return filtered.map((species) => ({
      speciesCode: species.speciesCode,
      comName: species.comName,
      sciName: species.sciName,
    }));
  } catch (error) {
    console.error("eBird search error:", error);
    return [];
  }
}

// Cache the full taxonomy for faster subsequent searches
let taxonomyCache: EBirdSpecies[] | null = null;

export async function searchSpeciesCached(
  query: string
): Promise<EBirdSpecies[]> {
  if (!query || query.length < 2) {
    return [];
  }

  if (!EBIRD_API_KEY) {
    console.error("eBird API key not configured");
    return [];
  }

  try {
    // Fetch and cache taxonomy if not already cached
    if (!taxonomyCache) {
      const response = await fetch(
        `${EBIRD_API_BASE}/ref/taxonomy/ebird?fmt=json&cat=species`,
        {
          headers: {
            "X-eBirdApiToken": EBIRD_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch species from eBird");
      }

      taxonomyCache = await response.json();
    }

    // Filter cached species by query
    const queryLower = query.toLowerCase();
    return (taxonomyCache || [])
      .filter(
        (species) =>
          species.comName.toLowerCase().includes(queryLower) ||
          species.sciName.toLowerCase().includes(queryLower)
      )
      .slice(0, 20);
  } catch (error) {
    console.error("eBird search error:", error);
    return [];
  }
}
