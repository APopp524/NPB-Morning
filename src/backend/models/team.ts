export interface Team {
  id: string;
  name: string;
  nameEn: string;
  league: 'central' | 'pacific';
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string | null;
  thumbnailSource?: string | null;
  thumbnailUpdatedAt?: Date | null;
}

export interface TeamInput {
  name: string;
  nameEn: string;
  league: 'central' | 'pacific';
}

