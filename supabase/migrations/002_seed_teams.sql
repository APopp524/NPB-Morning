-- 002_seed_teams.sql
-- Seed static NPB teams (Japanese + English)
-- Teams are configuration data, seeded once via migration, never fetched at runtime.

INSERT INTO teams (id, name, name_en, league)
VALUES
  -- Central League
  ('yomiuri-giants', '読売ジャイアンツ', 'Yomiuri Giants', 'central'),
  ('hanshin-tigers', '阪神タイガース', 'Hanshin Tigers', 'central'),
  ('chunichi-dragons', '中日ドラゴンズ', 'Chunichi Dragons', 'central'),
  ('tokyo-yakult-swallows', '東京ヤクルトスワローズ', 'Tokyo Yakult Swallows', 'central'),
  ('hiroshima-toyo-carp', '広島東洋カープ', 'Hiroshima Toyo Carp', 'central'),
  ('yokohama-dena-baystars', '横浜DeNAベイスターズ', 'Yokohama DeNA BayStars', 'central'),

  -- Pacific League
  ('fukuoka-softbank-hawks', '福岡ソフトバンクホークス', 'Fukuoka SoftBank Hawks', 'pacific'),
  ('chiba-lotte-marines', '千葉ロッテマリーンズ', 'Chiba Lotte Marines', 'pacific'),
  ('tohoku-rakuten-golden-eagles', '東北楽天ゴールデンイーグルス', 'Tohoku Rakuten Golden Eagles', 'pacific'),
  ('saitama-seibu-lions', '埼玉西武ライオンズ', 'Saitama Seibu Lions', 'pacific'),
  ('hokkaido-nippon-ham-fighters', '北海道日本ハムファイターズ', 'Hokkaido Nippon-Ham Fighters', 'pacific'),
  ('orix-buffaloes', 'オリックス・バファローズ', 'Orix Buffaloes', 'pacific')
ON CONFLICT (id) DO NOTHING;

