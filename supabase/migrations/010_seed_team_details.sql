-- 010_seed_team_details.sql
-- Populate team metadata for all 12 NPB teams.
-- Stadium names and websites sourced from npb.jp/eng/teams/.
-- Social media handles are best-effort and may need correction.

-- Central League

UPDATE teams SET
  stadium = 'Tokyo Dome',
  city = 'Tokyo',
  website_url = 'https://www.giants.jp',
  twitter_url = 'https://x.com/TokyoGiants',
  instagram_url = 'https://www.instagram.com/yomiuri.giants/',
  youtube_channel_url = 'https://www.youtube.com/@YOMIURI_GIANTS'
WHERE id = 'yomiuri-giants';

UPDATE teams SET
  stadium = 'Hanshin Koshien Stadium',
  city = 'Nishinomiya, Hyogo',
  website_url = 'https://hanshintigers.jp',
  twitter_url = 'https://x.com/tigersdreamlink',
  instagram_url = 'https://www.instagram.com/hanshintigers_official/',
  youtube_channel_url = 'https://www.youtube.com/@hanshintigers_official'
WHERE id = 'hanshin-tigers';

UPDATE teams SET
  stadium = 'Vantelin Dome Nagoya',
  city = 'Nagoya, Aichi',
  website_url = 'https://dragons.jp',
  twitter_url = 'https://x.com/DragonsOfficial',
  instagram_url = 'https://www.instagram.com/chunichidragonsofficial/',
  youtube_channel_url = 'https://www.youtube.com/@CHUNICHI_DRAGONS'
WHERE id = 'chunichi-dragons';

UPDATE teams SET
  stadium = 'Jingu Stadium',
  city = 'Tokyo',
  website_url = 'https://www.yakult-swallows.co.jp',
  twitter_url = 'https://x.com/swallowspr',
  instagram_url = 'https://www.instagram.com/swallows_ys_official/',
  youtube_channel_url = 'https://www.youtube.com/@Yakult-swallowsCoJp
'
WHERE id = 'tokyo-yakult-swallows';

UPDATE teams SET
  stadium = 'MAZDA Zoom-Zoom Stadium Hiroshima',
  city = 'Hiroshima',
  website_url = 'https://www.carp.co.jp',
  twitter_url = NULL,
  instagram_url = 'https://www.instagram.com/carp_official/',
  youtube_channel_url = 'https://www.youtube.com/@広島東洋カープ公式'
WHERE id = 'hiroshima-toyo-carp';

UPDATE teams SET
  stadium = 'Yokohama Stadium',
  city = 'Yokohama, Kanagawa',
  website_url = 'https://www.baystars.co.jp',
  twitter_url = 'https://x.com/ydb_yokohama',
  instagram_url = 'https://www.instagram.com/baystars_official/',
  youtube_channel_url = 'https://www.youtube.com/c/YOKOHAMADeNABAYSTARSCHANNEL'
WHERE id = 'yokohama-dena-baystars';

-- Pacific League

UPDATE teams SET
  stadium = 'MIZUHO PayPay Dome Fukuoka',
  city = 'Fukuoka',
  website_url = 'https://www.softbankhawks.co.jp',
  twitter_url = 'https://x.com/HAWKS_official',
  instagram_url = 'https://www.instagram.com/softbankhawks_official/',
  youtube_channel_url = 'https://www.youtube.com/@SBHawksOfficial'
WHERE id = 'fukuoka-softbank-hawks';

UPDATE teams SET
  stadium = 'ZOZO Marine Stadium',
  city = 'Chiba',
  website_url = 'https://www.marines.co.jp',
  twitter_url = 'https://x.com/chibalotte',
  instagram_url = 'https://www.instagram.com/chibalotte/',
  youtube_channel_url = 'https://www.youtube.com/@chibalotte'
WHERE id = 'chiba-lotte-marines';

UPDATE teams SET
  stadium = 'Rakuten Mobile Park Miyagi',
  city = 'Sendai, Miyagi',
  website_url = 'https://www.rakuteneagles.jp',
  twitter_url = 'https://x.com/rakuten__eagles',
  instagram_url = 'https://www.instagram.com/rakuten_eagles/',
  youtube_channel_url = 'https://www.youtube.com/@rakuteneagles'
WHERE id = 'tohoku-rakuten-golden-eagles';

UPDATE teams SET
  stadium = 'Belluna Dome',
  city = 'Tokorozawa, Saitama',
  website_url = 'https://www.seibulions.jp',
  twitter_url = 'https://x.com/Lions_Official',
  instagram_url = 'https://www.instagram.com/saitama_seibu_lions_official/',
  youtube_channel_url = 'https://www.youtube.com/@lions'
WHERE id = 'saitama-seibu-lions';

UPDATE teams SET
  stadium = 'ES CON Field Hokkaido',
  city = 'Kitahiroshima, Hokkaido',
  website_url = 'https://www.fighters.co.jp',
  twitter_url = 'https://x.com/FightersPR',
  instagram_url = 'https://www.instagram.com/fighters_official/',
  youtube_channel_url = 'https://www.youtube.com/@FIGHTERSofficial'
WHERE id = 'hokkaido-nippon-ham-fighters';

UPDATE teams SET
  stadium = 'Kyocera Dome Osaka',
  city = 'Osaka',
  website_url = 'https://www.buffaloes.co.jp',
  twitter_url = 'https://x.com/Orix_Buffaloes',
  instagram_url = 'https://www.instagram.com/orix_buffaloes/',
  youtube_channel_url = 'https://www.youtube.com/@buffaloestv'
WHERE id = 'orix-buffaloes';
