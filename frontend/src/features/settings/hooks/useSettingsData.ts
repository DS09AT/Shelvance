import { useState, useEffect } from 'react';
import { getRootFolders, getQualityProfiles, getMetadataProfiles } from '../services/settingsService';
import { RootFolder, QualityProfile, MetadataProfile } from '../types';

export function useRootFolders() {
  const [rootFolders, setRootFolders] = useState<RootFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const data = await getRootFolders();
        setRootFolders(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch root folders'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchFolders();
  }, []);

  return { rootFolders, isLoading, error };
}

export function useQualityProfiles() {
  const [qualityProfiles, setQualityProfiles] = useState<QualityProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await getQualityProfiles();
        setQualityProfiles(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch quality profiles'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  return { qualityProfiles, isLoading, error };
}

export function useMetadataProfiles() {
  const [metadataProfiles, setMetadataProfiles] = useState<MetadataProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await getMetadataProfiles();
        setMetadataProfiles(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metadata profiles'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  return { metadataProfiles, isLoading, error };
}
