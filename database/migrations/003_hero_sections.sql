-- Hero Section Management Schema
-- This table stores hero section slides with support for images/videos

CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text VARCHAR(100) DEFAULT 'Learn More',
  cta_link VARCHAR(500),
  
  -- Background media options
  background_type VARCHAR(20) DEFAULT 'default' CHECK (background_type IN ('default', 'image', 'video', 'none')),
  background_image_url TEXT,
  background_video_url TEXT,
  
  -- Card/Featured media options
  card_type VARCHAR(20) DEFAULT 'image' CHECK (card_type IN ('image', 'video')),
  card_image_url TEXT,
  card_video_url TEXT,
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_sections_active_order ON hero_sections(is_active, display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_sections_updated_at();

-- Insert default hero sections
INSERT INTO hero_sections (title, subtitle, description, cta_text, cta_link, background_type, card_image_url, display_order, is_active)
VALUES 
  (
    'EVERY MOMENT "PRATIPAL"',
    'Do you need healing?',
    'Healing is not merely cure, it is weaving smile in routine. At Pratipal, I am your personal healing assistant, to integrate the methodology of ancient healing rituals, into your modern lifestyle in a seamless, natural & progressive manner, without disturbing your routine.',
    'Explore Products',
    '/shop',
    'default',
    'https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=610',
    1,
    true
  ),
  (
    'Healing Essential Oil Roll-Ons',
    'Therapeutic grade oils for everyday wellness',
    'Experience the power of aromatherapy with our handcrafted essential oil blends',
    'Shop Now',
    '/shop',
    'default',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&h=700&fit=crop',
    2,
    true
  ),
  (
    'Energy Intention Salts',
    'Cleanse your aura with crystal-infused bath salts',
    'Transform your bathing ritual into a sacred healing experience',
    'Discover',
    '/mood-refresher',
    'default',
    'https://www.nytarra.in/cdn/shop/files/9_f34914c2-e1fa-453c-af98-4039446e9577.jpg?v=1767872410&width=823',
    3,
    true
  );
