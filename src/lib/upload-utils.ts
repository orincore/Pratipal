import { toast } from "sonner";

export interface UploadOptions {
  endpoint?: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  toastId?: string;
}

export interface UploadResult {
  url: string;
  fileName: string;
  key?: string;
  storage: "r2" | "local";
  type: "image" | "video";
}

export class UploadManager {
  /**
   * Upload a single file with progress tracking
   */
  static async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      endpoint = "/api/upload",
      maxSize = 10,
      allowedTypes = ["image/"],
      toastId = "upload",
    } = options;

    // Validate file type
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      const typeNames = allowedTypes.map(type => type.replace("/", "")).join(", ");
      throw new Error(`Only ${typeNames} files are allowed`);
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSize}MB`);
    }

    const formData = new FormData();
    formData.append("file", file);
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    try {
      toast.loading("Uploading...", { id: toastId });

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      
      toast.success(
        `Upload successful${result.storage === 'r2' ? ' (R2)' : ' (Local)'}!`,
        { id: toastId }
      );

      return {
        url: result.url,
        fileName: result.fileName,
        key: result.key,
        storage: result.storage,
        type: result.type || (file.type.startsWith("image/") ? "image" : "video"),
      };
    } catch (error: any) {
      toast.error(error.message || "Upload failed", { id: toastId });
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileOptions = {
        ...options,
        toastId: `${options.toastId || "upload"}-${i}`,
      };
      
      try {
        const result = await this.uploadFile(file, fileOptions);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files
      }
    }
    
    return results;
  }

  /**
   * Upload with drag and drop support
   */
  static handleDragAndDrop(
    onUpload: (files: File[]) => void,
    options: { allowedTypes?: string[] } = {}
  ) {
    const { allowedTypes = ["image/"] } = options;

    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files).filter(file => {
          return allowedTypes.some(type => file.type.startsWith(type));
        });
        
        if (files.length > 0) {
          onUpload(files);
        } else {
          const typeNames = allowedTypes.map(type => type.replace("/", "")).join(", ");
          toast.error(`Please drop ${typeNames} files only`);
        }
      },
    };
  }

  /**
   * Get upload endpoint for specific content type
   */
  static getEndpoint(contentType: "products" | "courses" | "services" | "general" = "general"): string {
    switch (contentType) {
      case "products":
        return "/api/upload/products";
      case "courses":
        return "/api/upload/courses";
      case "services":
        return "/api/upload/services";
      default:
        return "/api/upload";
    }
  }

  /**
   * Get allowed file types for content type
   */
  static getAllowedTypes(contentType: "products" | "courses" | "services" | "general" = "general"): string[] {
    switch (contentType) {
      case "products":
        return ["image/", "video/"];
      case "courses":
      case "services":
        return ["image/"];
      default:
        return ["image/"];
    }
  }

  /**
   * Get max file size for content type (in MB)
   */
  static getMaxSize(contentType: "products" | "courses" | "services" | "general" = "general"): number {
    switch (contentType) {
      case "products":
        return 50; // Allow larger files for product videos
      case "courses":
      case "services":
      case "general":
      default:
        return 10;
    }
  }
}

export default UploadManager;