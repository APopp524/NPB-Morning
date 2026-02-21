export interface TeamVideo {
  id: string;
  teamId: string;
  videoId: string;
  title: string;
  link: string;
  thumbnail: string | null;
  publishedAt: string | null;
  channelName: string | null;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamVideoInput {
  teamId: string;
  videoId: string;
  title: string;
  link: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
  channelName?: string | null;
}
