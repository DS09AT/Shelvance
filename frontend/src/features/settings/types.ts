export interface RootFolder {
  id: number;
  path: string;
  freeSpace: number;
  totalSpace: number;
  unmappedFolders: number;
}

export interface QualityProfile {
  id: number;
  name: string;
}

export interface MetadataProfile {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  label: string;
}
