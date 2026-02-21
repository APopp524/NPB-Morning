export interface Team {
  id: string
  name: string
  name_en: string
  league: 'central' | 'pacific'
  thumbnail_url: string | null
}
