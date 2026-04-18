"use client";

import { useState, useEffect, useMemo } from 'react';
import { useVenueState } from './use-venue-state';
import { PredictionService } from '@/lib/services/prediction.service';
import { VenueService, QueueState } from '@/lib/types';

export function useServices(filter: string = 'all') {
  const { venueData } = useVenueState();
  const [predictions, setPredictions] = useState<Record<string, QueueState>>({});

  useEffect(() => {
    if (venueData?.services) {
      venueData.services.forEach(async (s) => {
        // Only fetch if not already present or if we want to refresh
        if (!predictions[s.id]) {
          const pred = await PredictionService.getQueueStatus(s.id, s.wait, s.type as any);
          setPredictions(prev => ({ ...prev, [s.id]: pred }));
        }
      });
    }
  }, [venueData?.services, predictions]);

  const services = useMemo(() => {
    const allServices = (venueData?.services || []).map(s => ({
      ...s,
      ...predictions[s.id]
    }));

    if (filter === 'all') return allServices;
    return allServices.filter(s => s.type === filter);
  }, [venueData?.services, predictions, filter]);

  return {
    services,
    isLoading: !venueData
  };
}
