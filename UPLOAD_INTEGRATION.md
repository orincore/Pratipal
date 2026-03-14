# R2 Upload Integration

This document explains how the R2 upload integration works and how to configure it.

## Overview

The application now supports uploading images and videos to Cloudflare R2 bucket with automatic fallback to local storage. All upload functionality has been enhanced to use R2 when configured, providing better performance and scalability.

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Cloudflare R2 Storage (preferred for image uploads)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_URL=https://your-custom-domain.com
# Alternative: R2_PUBLIC_URL=https://pub-your-bucket-id.r2.dev
```

### R2 Bucket Setup

1. Create a Cloudflare R2 bucket
2. Generate API tokens with R2 permissions
3. Configure public access for the bucket (optional, for direct access)
4. Set up a custom domain or use the default R2.dev URL

## Features

### Automatic Fallback
- If R2 is configured and available, files upload to R2
- If R2 fails or isn't configured, files save locally
- Users get feedback about which storage was used

### Specialized Endpoints
- `/api/upload/products` - For product images/videos (50MB limit)
- `/api/upload/courses` - For course images (10MB limit)  
- `/api/upload/services` - For service images (10MB limit)
- `/api/upload` - General uploads (10MB limit)

### Content-Specific Handling
- **Products**: Supports images and videos up to 50MB
- **Courses**: Images only up to 10MB
- **Services**: Images only up to 10MB
- **General**: Images only up to 10MB

## Updated Components

### Admin Pages
- ✅ **Courses Page**: Uses `/api/upload/courses`
- ✅ **Services Page**: Uses `/api/upload/services`  
- ✅ **Products Page**: Uses `/api/upload/products`
- ✅ **Rich Editor**: Enhanced with R2 feedback
- ✅ **Template Editor**: Enhanced with R2 feedback

### Upload Components
- ✅ **UploadZone**: New reusable upload component
- ✅ **UploadManager**: Utility class for upload operations
- ✅ **R2Storage**: R2 client with fallback logic

## Usage Examples

### Using UploadZone Component

```tsx
import { UploadZone, UploadedFile } from "@/components/admin/upload-zone";
import { UploadResult } from "@/lib/upload-utils";

function MyComponent() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  const handleUpload = (results: UploadResult[]) => {
    setUploadedFiles(prev => [...prev, ...results]);
  };

  return (
    <div>
      <UploadZone
        onUpload={handleUpload}
        contentType="products" // or "courses", "services", "general"
        multiple={true}
        maxFiles={5}
      />
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        {uploadedFiles.map((file, index) => (
          <UploadedFile
            key={index}
            file={file}
            onRemove={() => {
              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Using UploadManager Directly

```tsx
import UploadManager from "@/lib/upload-utils";

async function handleFileUpload(file: File) {
  try {
    const result = await UploadManager.uploadFile(file, {
      endpoint: "/api/upload/products",
      maxSize: 50,
      allowedTypes: ["image/", "video/"],
      toastId: "product-upload"
    });
    
    console.log("Uploaded to:", result.storage); // "r2" or "local"
    console.log("File URL:", result.url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

## File Organization

### R2 Bucket Structure
```
bucket/
├── products/
│   ├── uuid1.jpg
│   └── uuid2.mp4
├── courses/
│   └── uuid3.png
├── services/
│   └── uuid4.jpg
└── uploads/
    └── uuid5.gif
```

### Local Storage Structure
```
public/
├── products/
├── courses/
├── services/
└── uploads/
```

## Benefits

1. **Scalability**: R2 handles large files and high traffic better than local storage
2. **Performance**: CDN-like delivery for faster image loading
3. **Reliability**: Automatic fallback ensures uploads always work
4. **Cost-Effective**: R2 is cheaper than traditional CDNs
5. **Global**: Better performance for international users

## Migration

Existing local files will continue to work. New uploads will use R2 when configured. To migrate existing files:

1. Set up R2 configuration
2. Run a migration script to move existing files (not included)
3. Update database URLs to point to R2 (if needed)

## Troubleshooting

### R2 Upload Fails
- Check environment variables are set correctly
- Verify R2 bucket permissions
- Check network connectivity
- Review R2 API token permissions

### Files Not Accessible
- Verify R2_PUBLIC_URL is correct
- Check bucket public access settings
- Ensure custom domain is properly configured

### Large File Uploads
- Increase server timeout settings
- Check R2 upload limits
- Consider implementing chunked uploads for very large files

## Security Considerations

1. **API Tokens**: Keep R2 credentials secure and rotate regularly
2. **File Validation**: All uploads are validated for type and size
3. **Public Access**: Only enable if files should be publicly accessible
4. **CORS**: Configure R2 CORS settings if needed for direct browser uploads

## Future Enhancements

- [ ] Chunked uploads for large files
- [ ] Image optimization and resizing
- [ ] Automatic backup to multiple storage providers
- [ ] Upload progress tracking
- [ ] Batch upload operations
- [ ] File deduplication