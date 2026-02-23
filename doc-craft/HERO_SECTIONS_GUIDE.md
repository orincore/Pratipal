# Hero Sections Management

## Location
`/admin/hero-sections`

## Purpose
Manage homepage carousel slides with custom content, images, and CTAs.

## Features
- Create/Edit/Delete hero slides
- Toggle active/inactive (show/hide)
- Reorder slides (display_order)
- Visual preview thumbnails

## Fields
**Content**
- Title, Subtitle, Description
- CTA Text & Link

**Background**
- Type: default gradient, image, video, none
- Image/Video URL (if applicable)

**Featured Card**
- Type: image or video
- Image/Video URL

**Display**
- Display Order (numeric)
- Is Active (checkbox)

## Database
```sql
CREATE TABLE hero_sections (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text VARCHAR(100) DEFAULT 'Learn More',
  cta_link VARCHAR(500),
  background_type VARCHAR(20) DEFAULT 'default',
  background_image_url TEXT,
  background_video_url TEXT,
  card_type VARCHAR(20) DEFAULT 'image',
  card_image_url TEXT,
  card_video_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## API Endpoints
- `GET /api/admin/hero-sections` - List all
- `POST /api/admin/hero-sections` - Create
- `PUT /api/admin/hero-sections/[id]` - Update
- `DELETE /api/admin/hero-sections/[id]` - Delete

## Tips
- Use high-quality images (1200x700px+)
- Deactivate instead of delete to preserve
- Test with `is_active: false` before publishing
- Use relative paths for internal links (/shop)
