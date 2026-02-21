export interface Team {
  id: string
  name: string
  name_en: string
  league: 'central' | 'pacific'
  thumbnail_url: string | null
}

export interface TeamDetail extends Team {
  stadium: string | null
  city: string | null
  website_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  youtube_channel_url: string | null
}

export interface YouTubeVideo {
  videoId: string
  title: string
  thumbnail: string | null
  publishedAt: string | null
  channelName: string | null
  link: string
}
