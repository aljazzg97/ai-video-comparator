"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Film, Code, Maximize, Database, AlertTriangle } from "lucide-react";
import { VideoMetadata } from "@/lib/extractMetadata";
import { useState } from "react";

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  label: string;
  metadata: VideoMetadata | null;
  isLoading: boolean;
}

// Allowed MIME types and extensions
const ACCEPTED_VIDEO_TYPES = {
  "video/mp4": [".mp4"],
  "video/x-matroska": [".mkv"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "video/webm": [".webm"],
};

export default function VideoDropzone({
  onFileSelect,
  selectedFile,
  label,
  metadata,
  isLoading,
}: VideoDropzoneProps) {
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setRejectedReason(null);
      
      // Handle rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errors = rejection.errors.map(e => e.message).join(", ");
        setRejectedReason(`File rejected: ${errors}`);
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Double-check file type using extension and MIME
        const validExtensions = [".mp4", ".mkv", ".mov", ".avi", ".webm"];
        const hasValidExtension = validExtensions.some(ext => 
          file.name.toLowerCase().endsWith(ext)
        );
        const hasValidMime = file.type.startsWith("video/") || 
                             file.type === "video/x-matroska" ||
                             file.type === "video/x-msvideo";
        
        if (!hasValidExtension || !hasValidMime) {
          setRejectedReason("Please select a valid video file (.mp4, .mkv, .mov, .avi, .webm)");
          return;
        }
        
        onFileSelect(file);
      }
    },
    accept: ACCEPTED_VIDEO_TYPES,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 * 1024, // 10 GB max (optional)
  });

  return (
    <div className="flex-1">
      <h3 className="mb-2 text-sm font-medium text-gray-300">{label}</h3>
      <div
        {...getRootProps()}
        className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all
          ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
          } ${rejectedReason ? "border-red-500 bg-red-900/20" : ""}`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-gray-700" />
            <p className="mt-2 text-sm text-gray-400">Extracting metadata...</p>
          </div>
        ) : selectedFile ? (
          <div className="text-center">
            <Film className="mx-auto h-10 w-10 text-blue-400" />
            <p className="mt-2 text-sm font-medium text-white">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-300">
              {isDragActive ? "Drop video here" : "Drag & drop or click to select"}
            </p>
            <p className="mt-1 text-xs text-gray-500">.mp4, .mkv, .mov, .avi, .webm</p>
          </>
        )}
      </div>

      {/* Rejection error */}
      {rejectedReason && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-red-900/30 p-2 text-xs text-red-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{rejectedReason}</span>
        </div>
      )}

      {/* Metadata Summary Card */}
      {metadata && !isLoading && (
        <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800/40 p-3 text-xs backdrop-blur-sm">
          {/* ... existing metadata card JSX ... */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1 text-gray-400">
              <Code className="h-3 w-3" />
              <span>Codec:</span>
            </div>
            <div className="font-mono text-blue-300">{metadata.videoCodec}</div>

            <div className="flex items-center gap-1 text-gray-400">
              <Maximize className="h-3 w-3" />
              <span>Resolution:</span>
            </div>
            <div className="font-mono text-blue-300">{metadata.resolution}</div>

            <div className="flex items-center gap-1 text-gray-400">
              <Database className="h-3 w-3" />
              <span>Bitrate:</span>
            </div>
		<div className="font-mono text-blue-300">
	{metadata.bitRate
    ? metadata.bitRate >= 1000000
      ? `${(metadata.bitRate / 1000000).toFixed(1)} Mbps`
      : `${(metadata.bitRate / 1000).toFixed(0)} kbps`
    : "N/A"}
		</div>
          </div>
          {metadata.bitDepth && (
            <div className="mt-1 border-t border-gray-700 pt-1 text-center">
              <span className="text-gray-400">Bit Depth: </span>
              <span className="font-mono text-green-300">
                {metadata.bitDepth}-bit
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}