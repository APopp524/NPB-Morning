export interface Team {
  id: string;
  name: string;
  nameEn: string;
  league: 'central' | 'pacific';
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamInput {
  name: string;
  nameEn: string;
  league: 'central' | 'pacific';
}

