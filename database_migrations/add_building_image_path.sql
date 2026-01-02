-- Bina resim yükleme özelliği için image_path kolonu ekleme

-- Eğer kolon yoksa ekle
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS image_path VARCHAR(500) NULL AFTER icon;

-- İndeks ekle (hızlı arama için)
CREATE INDEX idx_buildings_image ON buildings(image_path);
