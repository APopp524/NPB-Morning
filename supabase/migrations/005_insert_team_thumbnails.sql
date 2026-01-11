-- 005_insert_team_thumbnails.sql
-- Populate team thumbnail URLs via manual migration
-- Thumbnails are static reference data and should not be updated by cron jobs

-- Central League
UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f531169b66e81becc54524a9b227815037ea0677bc624bee640a2.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'yomiuri-giants' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f5311a93d6c9d5a8a271ee06e3265c2240612c4841d16a7b92183.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'hanshin-tigers' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f5311a48107ac4ca07bf295c48e2494f57735656f2f381a5281f3.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'chunichi-dragons' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f53117c9526ec7794a80fc311766c582cee9b2356c9d58148620f.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'tokyo-yakult-swallows' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f53112710f1297207bf98d98941ff6c473ae069beb8d4dd85c1b7.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'hiroshima-toyo-carp' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/69632194af5fdca190a8a5dd/images/f7ea1d1ce3e3c18989b486f8129ed8783a2161d48734fa653446406f100f5311aef795814cfa87ec7b750e88f2cd99f4f012e27baf9c83b6.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'yokohama-dena-baystars' AND thumbnail_url IS NULL;

-- Pacific League
UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88ceb068cd9b7e11d63a03844e3b40d9c8305f8b3deb0d85def.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'fukuoka-softbank-hawks' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88c89fc465aec4ed1ac53249ac0168c5997e01d943b01c496b2.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'chiba-lotte-marines' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88c7cc2f09090bc3867251d8223e0f72fe9ce536f39aa09ef66.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'tohoku-rakuten-golden-eagles' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88c8d250c1a5fb5e0715e8f01f0699f2646805de05e9f4e7fbd.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'saitama-seibu-lions' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88cb91a659a22a9bfde267fdc49e3f3a5b831e87766a73e4291.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'hokkaido-nippon-ham-fighters' AND thumbnail_url IS NULL;

UPDATE teams
SET 
  thumbnail_url = 'https://serpapi.com/searches/696321945abea56a6141da22/images/a57d2fb44ef672a32de2d7d8254a91c7fc6c2ddcc459d59b0931149bf833d88c082ee0d3826e462621e2696629c7e8849c0fe7d9abab15e2.png',
  thumbnail_source = 'manual',
  thumbnail_updated_at = NOW()
WHERE id = 'orix-buffaloes' AND thumbnail_url IS NULL;

