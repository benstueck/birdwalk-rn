import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";

interface BirdImageProps {
  speciesName: string;
  scientificName?: string | null;
  size?: "sm" | "md" | "lg" | "hero";
}

const sizeStyles = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-16 h-16 rounded-xl",
  lg: "w-24 h-24 rounded-2xl",
  hero: "w-full aspect-[4/3]",
};

// Client-side cache for image URLs
const imageCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

// Convert to Wikipedia sentence case: "Common Raven" -> "Common raven"
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

async function fetchBirdImage(
  speciesName: string,
  scientificName?: string | null
): Promise<string | null> {
  const cacheKey = `${scientificName || ""}|${speciesName}`;

  // Return cached result
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Return pending request if one exists (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Try scientific name first, then common name
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

export function BirdImage({
  speciesName,
  scientificName,
  size = "md",
}: BirdImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerClass = sizeStyles[size];

  useEffect(() => {
    let cancelled = false;

    fetchBirdImage(speciesName, scientificName).then((url) => {
      if (cancelled) return;
      setImageUrl(url);
      setHasError(url === null);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [speciesName, scientificName]);

  if (isLoading) {
    return (
      <View className={`${containerClass} bg-gray-200 overflow-hidden`} />
    );
  }

  if (hasError || !imageUrl) {
    return (
      <View
        className={`${containerClass} bg-gray-100 overflow-hidden items-center justify-center`}
      >
        <Text className="text-gray-400 text-lg">?</Text>
      </View>
    );
  }

  return (
    <View className={`${containerClass} overflow-hidden bg-slate-300`}>
      <Image
        source={{ uri: imageUrl }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        cachePolicy="disk"
        onError={() => setHasError(true)}
      />
    </View>
  );
}
