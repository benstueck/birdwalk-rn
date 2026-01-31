import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, Alert, Dimensions } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { Sighting } from "../types/database";
import {
  fetchBirdImage,
  getCachedImageUrl,
  getCachedDimensions,
  cacheDimensions,
} from "../utils/birdImages";
import { EditSightingModal } from "./EditSightingModal";

const MAX_IMAGE_HEIGHT = 280;
const BACKGROUND_COLOR = "#cbd5e1"; // slate-300
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SightingModalProps {
  visible: boolean;
  sighting: Sighting | null;
  onClose: () => void;
  onDelete?: (sightingId: string) => void;
  onSightingUpdated?: (sighting: Sighting) => void;
  topInset?: number;
}

export function SightingModal({
  visible,
  sighting,
  onClose,
  onDelete,
  onSightingUpdated,
  topInset,
}: SightingModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const visibleRef = useRef(visible);
  const [showEditModal, setShowEditModal] = useState(false);

  // Keep ref in sync with prop
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Initialize from cache if available
  const initialUrl = sighting ? getCachedImageUrl(sighting.species_name, sighting.scientific_name) : undefined;
  const initialDimensions = sighting ? getCachedDimensions(sighting.species_name, sighting.scientific_name) : undefined;

  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl ?? null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(initialDimensions ?? null);
  const [isLoading, setIsLoading] = useState(initialUrl === undefined);

  // Fetch image when sighting changes
  useEffect(() => {
    if (!sighting) return;

    const cachedUrl = getCachedImageUrl(sighting.species_name, sighting.scientific_name);
    const cachedDimensions = getCachedDimensions(sighting.species_name, sighting.scientific_name);

    // If already cached, use cached values without resetting state
    if (cachedUrl !== undefined) {
      setImageUrl(cachedUrl);
      setImageSize(cachedDimensions ?? null);
      setIsLoading(false);
      return;
    }

    // Only show loading state if not cached
    setIsLoading(true);

    fetchBirdImage(sighting.species_name, sighting.scientific_name).then((url) => {
      setImageUrl(url);
      setIsLoading(false);
    });
  }, [sighting?.species_name, sighting?.scientific_name]);

  // Memoize image dimensions calculation
  const { containerHeight, needsHorizontalLetterbox } = useMemo(() => {
    if (!imageSize) {
      return { containerHeight: SCREEN_WIDTH * 0.75, needsHorizontalLetterbox: false };
    }

    const aspectRatio = imageSize.width / imageSize.height;
    const naturalHeight = SCREEN_WIDTH / aspectRatio;
    const cappedHeight = Math.min(naturalHeight, MAX_IMAGE_HEIGHT);
    const needsLetterbox = naturalHeight > MAX_IMAGE_HEIGHT;

    return { containerHeight: cappedHeight, needsHorizontalLetterbox: needsLetterbox };
  }, [imageSize]);

  const renderBackdrop = useCallback(
    (props: any) => {
      if (!visible) return null;
      return (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      );
    },
    [visible]
  );

  useEffect(() => {
    if (visible && sighting) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, sighting]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      // Only close if user dismissed AND we're supposed to be visible
      // This prevents race conditions when opening a new modal
      if (index === -1 && visibleRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (!sighting) return;

    Alert.alert(
      "Delete Sighting",
      `Are you sure you want to delete this sighting of ${sighting.species_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete?.(sighting.id);
            onClose();
          },
        },
      ]
    );
  }, [sighting, onDelete, onClose]);

  const handleImageLoad = useCallback(
    (e: { source: { width: number; height: number } }) => {
      const dimensions = { width: e.source.width, height: e.source.height };
      setImageSize(dimensions);
      if (sighting) {
        cacheDimensions(sighting.species_name, sighting.scientific_name, dimensions);
      }
    },
    [sighting]
  );

  return (
    <>
      <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      topInset={topInset}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      maxDynamicContentSize={SCREEN_HEIGHT * 0.85}
    >
      <BottomSheetScrollView>
        {sighting && (
          <View className="pb-6">
            {/* Hero Image with Overlay */}
            <View className="relative">
              <View
                style={{
                  width: SCREEN_WIDTH,
                  height: containerHeight,
                  backgroundColor: needsHorizontalLetterbox ? BACKGROUND_COLOR : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading && !imageUrl ? (
                  <View style={{ width: "100%", height: "100%", backgroundColor: "#e5e7eb" }} />
                ) : imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{
                      width: needsHorizontalLetterbox ? undefined : "100%",
                      height: "100%",
                      aspectRatio: imageSize ? imageSize.width / imageSize.height : undefined,
                    }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <Text className="text-gray-400 text-lg">?</Text>
                )}
              </View>

              {/* Dark overlay at bottom for text readability */}
              <View className="absolute bottom-0 left-0 right-0 h-16 bg-black/50" />

              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/30 rounded-full items-center justify-center"
              >
                <Text className="text-white text-lg">×</Text>
              </Pressable>

              {/* Title overlay */}
              <View className="absolute bottom-0 left-0 right-0 px-4 py-2">
                <Text className="text-2xl font-semibold text-white">
                  {sighting.species_name}
                </Text>
                {sighting.scientific_name && (
                  <Text className="text-sm text-white/80 italic mt-0.5">
                    {sighting.scientific_name}
                  </Text>
                )}
              </View>
            </View>

            {/* Details */}
            <View className="px-4 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-500">Time</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatTime(sighting.timestamp)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Type</Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name={sighting.type === "seen" ? "eye-outline" : "ear-outline"}
                    size={16}
                    color="#6b7280"
                  />
                  <Text className="text-sm font-medium text-gray-900 ml-1">
                    {sighting.type === "seen" ? "Seen" : "Heard"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {sighting.notes && (
              <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-sm text-gray-500 mb-1">Notes</Text>
                <Text className="text-sm text-gray-900">{sighting.notes}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="px-4 pt-4 flex-row justify-end items-center">
              {onSightingUpdated && (
                <Pressable
                  onPress={() => setShowEditModal(true)}
                  className="p-2 active:bg-gray-100 rounded-full mr-2"
                >
                  <Ionicons name="pencil-outline" size={22} color="#6b7280" />
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  onPress={handleDelete}
                  className="p-2 active:bg-gray-100 rounded-full"
                >
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </Pressable>
              )}
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>

      <EditSightingModal
        visible={showEditModal}
        sighting={sighting}
        topInset={topInset}
        onClose={() => setShowEditModal(false)}
        onSightingUpdated={(updated) => {
          setShowEditModal(false);
          onSightingUpdated?.(updated);
        }}
      />
    </>
  );
}
