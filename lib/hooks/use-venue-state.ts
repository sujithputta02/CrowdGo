"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VenueState, QueueState } from '@/lib/types';
import { PredictionService } from '@/lib/services/prediction.service';
import { logger } from '@/lib/logger.client';

export function useVenueState() {
  const [venueData, setVenueData] = useState<VenueState | null>(null);
  const [prediction, setPrediction] = useState<QueueState | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const venueRef = doc(db, "venues", "wankhede");
    const unsubscribe = onSnapshot(venueRef, (doc) => {
      if (doc.exists()) {
        setVenueData(doc.data() as VenueState);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const topService = venueData?.services?.[0];
    if (!topService) return;

    const controller = new AbortController();
    
    const debounceTimer = setTimeout(async () => {
      setIsThinking(true);
      try {
        const res = await PredictionService.getQueueStatus(
          topService.id,
          topService.wait,
          topService.type as any,
          controller.signal
        );
        setPrediction(res);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          logger.warn("Prediction Request Failed", { error: err.message });
        }
      } finally {
        setIsThinking(false);
      }
    }, 1500);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [venueData?.services]);

  return {
    venueData,
    prediction,
    isThinking,
    services: venueData?.services || [],
    notifications: venueData?.notifications || [],
    activeMatch: venueData?.activeMatch || {
      home: "Loading...",
      away: "...",
      score: "0 - 0",
      time: "0'",
      nextBreak: "...",
      nextSafeWindowIn: 0,
      momentum: "low" as const,
    }
  };
}
