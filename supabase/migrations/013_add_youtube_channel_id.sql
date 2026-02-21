-- 013_add_youtube_channel_id.sql
-- Add youtube_channel_id to teams for RSS feed fetching.
-- Channel IDs are resolved from each team's youtube_channel_url.

ALTER TABLE teams ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;

UPDATE teams SET youtube_channel_id = 'UCXxg0igSYUp0tqdd6luPEnQ' WHERE id = 'yomiuri-giants';
UPDATE teams SET youtube_channel_id = 'UCqm35j3ustKFyXQVnX5tlXw' WHERE id = 'hanshin-tigers';
UPDATE teams SET youtube_channel_id = 'UC57LcTUKgjDg_K_VJXnmCTg' WHERE id = 'chunichi-dragons';
UPDATE teams SET youtube_channel_id = 'UCt7cNctKXoKece38M9gJV7A' WHERE id = 'tokyo-yakult-swallows';
UPDATE teams SET youtube_channel_id = 'UC0VGvOEN22JcprH7pZrCwiw' WHERE id = 'hiroshima-toyo-carp';
UPDATE teams SET youtube_channel_id = 'UChJI9KrjSgPzv_kfX6yuqhA' WHERE id = 'yokohama-dena-baystars';
UPDATE teams SET youtube_channel_id = 'UCbDAmhyRx9bakv-0Gucglgg' WHERE id = 'fukuoka-softbank-hawks';
UPDATE teams SET youtube_channel_id = 'UC6qnjAoknKc6nUwhxVYL_DA' WHERE id = 'chiba-lotte-marines';
UPDATE teams SET youtube_channel_id = 'UC7DjQdai62xSVfCUhiP5Oiw' WHERE id = 'tohoku-rakuten-golden-eagles';
UPDATE teams SET youtube_channel_id = 'UChLK3zS3-kR21JVTaNovPIg' WHERE id = 'saitama-seibu-lions';
UPDATE teams SET youtube_channel_id = 'UCIEmSQYznT9cuTZzBN-x3SQ' WHERE id = 'hokkaido-nippon-ham-fighters';
UPDATE teams SET youtube_channel_id = 'UCE_pCd9bB79Tf8eC_QZHkpA' WHERE id = 'orix-buffaloes';
