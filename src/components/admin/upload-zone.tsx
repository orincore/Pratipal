"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UploadManager, { UploadResult } from "@/lib/upload-utils";

interface UploadZoneProps {
  onUpload: (results: UploadResult[]) => void;
  contentType?: "products" | "courses" | "services" | "general";
  multiple?: boolean;
  className?: string;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function UploadZone({
  onUpload,
  contentType = "general",
  multiple = false,
  className,
  accept,
  maxFiles = 10,
  disabled = false,
  children,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const allowedTypes = UploadManager.getAllowedTypes(contentType);
  const maxSize = UploadManager.getMaxSize(contentType);
  const endpoint = UploadManager.getEndpoint(contentType);

  const handleFiles = async (files: File[]) => {
    if (disabled || uploading) return;
    
    const filesToUpload = multiple ? files.slice(0, maxFiles) : [files[0]];
    
    setUploading(true);
    try {
      const results = await UploadManager.uploadFiles(filesToUpload, {
        endpoint,
        maxSize,
        allowedTypes,
      });
      
      if (results.length > 0) {
        onUpload(results);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  const dragHandlers = UploadManager.handleDragAndDrop(handleFiles, { allowedTypes });

  const handleDragEnter = (e: React.DragEvent) => {
    dragHandlers.onDragEnter(e);
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragHandlers.onDragLeave(e);
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    dragHandlers.onDrop(e);
    setIsDragActive(false);
  };

  const getFileTypeIcon = () => {
    if (allowedTypes.includes("video/")) {
      return <Video className="h-8 w-8 text-gray-400" />;
    } else if (allowedTypes.includes("image/")) {
      return <ImageIcon className="h-8 w-8 text-gray-400" />;
    }
    return <FileText className="h-8 w-8 text-gray-400" />;
  };

  const getAcceptString = () => {
    if (accept) return accept;
    return allowedTypes.map(type => `${type}*`).join(",");
  };

  const getTypeDescription = () => {
    const types = allowedTypes.map(type => type.replace("/", "").toUpperCase()).join(", ");
    return `${types} up to ${maxSize}MB`;
  };

  if (children) {
    return (
      <div
        className={cn(
          "relative",
          isDragActive && "ring-2 ring-primary ring-offset-2",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragOver={dragHandlers.onDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString()}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {children}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Drop files here</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors",
        isDragActive && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        uploading && "pointer-events-none",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragOver={dragHandlers.onDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled || uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="space-y-4">
        {getFileTypeIcon()}
        
        <div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading..." : isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getTypeDescription()}
            {multiple && ` • Max ${maxFiles} files`}
          </p>
        </div>

        {!uploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        )}
      </div>
    </div>
  );
}

interface UploadedFileProps {
  file: UploadResult;
  onRemove?: () => void;
  className?: string;
}

export function UploadedFile({ file, onRemove, className }: UploadedFileProps) {
  const isImage = file.type === "image";
  const isVideo = file.type === "video";

  return (
    <div className={cn("relative group", className)}>
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
        {isImage && (
          <img
            src={file.url}
            alt={file.fileName}
            className="w-full h-full object-cover"
          />
        )}
        {isVideo && (
          <video
            src={file.url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        )}
        {!isImage && !isVideo && (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <div className="mt-2">
        <p className="text-xs text-gray-600 truncate" title={file.fileName}>
          {file.fileName}
        </p>
        <p className="text-xs text-gray-400">
          {file.storage === "r2" ? "R2" : "Local"}
        </p>
      </div>
    </div>
  );
}

export default UploadZone;