import api from '@/shared/lib/api';
import { RootFolder, QualityProfile, MetadataProfile } from '../types';

export const getRootFolders = async (): Promise<RootFolder[]> => {
  const response = await api.get<RootFolder[]>('/rootFolder');
  return response.data;
};

export const getQualityProfiles = async (): Promise<QualityProfile[]> => {
  const response = await api.get<QualityProfile[]>('/qualityprofile');
  return response.data;
};

export const getMetadataProfiles = async (): Promise<MetadataProfile[]> => {
  const response = await api.get<MetadataProfile[]>('/metadataprofile');
  return response.data;
};
