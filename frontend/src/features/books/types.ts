export interface Book {
  id: number;
  title: string;
  authorId: number;
  seriesId?: number;
  isbn?: string;
  releaseDate?: string;
  ratings: {
    votes: number;
    value: number;
    popularity: number;
  };
  images: BookImage[];
  monitored: boolean;
  status: string;
  statistics?: {
    sizeOnDisk: number;
    percentOfBooks: number;
  };
}

export interface BookImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}
