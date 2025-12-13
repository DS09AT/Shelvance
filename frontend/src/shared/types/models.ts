export interface Author {
  id: number;
  name: string;
  cleanName: string;
  monitored: boolean;
  lastInfoSync?: string;
  path: string;
  rootFolderPath: string;
  added: string;
  qualityProfileId: number;
  metadataProfileId: number;
  tags: number[];
  statistics?: {
    bookCount: number;
    bookFileCount: number;
    totalBookCount: number;
    sizeOnDisk: number;
    percentOfBooks: number;
  };
}

export interface Book {
  id: number;
  authorId: number;
  title: string;
  monitored: boolean;
  anyEditionOk: boolean;
  ratings: {
    votes: number;
    value: number;
  };
  releaseDate?: string;
  pageCount: number;
  genres: string[];
  author?: Author;
}

export interface QualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: QualityProfileItem[];
}

export interface QualityProfileItem {
  quality?: {
    id: number;
    name: string;
  };
  items?: QualityProfileItem[];
  allowed: boolean;
  id?: number;
  name?: string;
}
