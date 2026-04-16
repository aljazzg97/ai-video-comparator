"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { VideoMetadata } from '@/lib/extractMetadata';

interface UltimateMetadataViewerProps {
  metadata: VideoMetadata;
  label: string;
}

export default function UltimateMetadataViewer({ metadata, label }: UltimateMetadataViewerProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'hdr' | 'container' | 'raw'>('video');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    video: true,
    audio: true,
    hdr: true,
    container: true,
  });

  const tabs = [
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'hdr', label: 'HDR / Color' },
    { id: 'container', label: 'Container' },
    { id: 'raw', label: 'Raw JSON' },
  ] as const;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      // Format large numbers with commas
      if (value > 1000000) return value.toLocaleString();
      return String(value);
    }
    return String(value);
  };

  const renderKeyValuePairs = (data: Record<string, any>, excludeKeys: string[] = []) => {
    return Object.entries(data)
      .filter(([key]) => !excludeKeys.includes(key) && !key.startsWith('_'))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => (
        <div key={key} className="grid grid-cols-2 gap-2 py-1 border-b border-gray-700/30 last:border-0">
          <span className="text-gray-400 text-xs font-medium break-words">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
          <span className="text-gray-200 text-xs font-mono break-all">{formatValue(value)}</span>
        </div>
      ));
  };

  const videoFields = {
    Codec: metadata.videoCodec,
    'Codec ID': metadata.videoCodecID,
    Profile: metadata.videoFormatProfile,
    Level: metadata.videoFormatLevel,
    Tier: metadata.videoFormatTier,
    'Format Settings': metadata.videoFormatSettings,
    Resolution: metadata.resolution,
    'Display Aspect Ratio': metadata.displayAspectRatio,
    'Pixel Aspect Ratio': metadata.pixelAspectRatio,
    'Frame Rate': metadata.frameRate ? `${metadata.frameRate} fps` : null,
    'Frame Rate Mode': metadata.frameRateMode,
    'Frame Count': metadata.frameCount,
    'Bit Depth': metadata.bitDepth ? `${metadata.bitDepth}-bit` : null,
    'Chroma Subsampling': metadata.chromaSubsampling,
    'Chroma Position': metadata.chromaSubsamplingPosition,
    'Color Space': metadata.colorSpace,
    'Scan Type': metadata.scanType,
    'Video Bitrate': metadata.bitRate ? `${(metadata.bitRate / 1000000).toFixed(2)} Mbps` : null,
    'Bitrate Mode': metadata.bitRateMode,
    Delay: metadata.delay ? `${metadata.delay} ms` : null,
    'Encoded Library': metadata.encodedLibrary,
    'Library Settings': metadata.encodedLibrarySettings,
  };

  const hdrFields = {
    'HDR Format': metadata.hdrFormat,
    'HDR Profile': metadata.hdrFormatProfile,
    'HDR Level': metadata.hdrFormatLevel,
    'HDR Settings': metadata.hdrFormatSettings,
    'HDR Compatibility': metadata.hdrFormatCompatibility,
    'Color Range': metadata.colourRange,
    'Color Primaries': metadata.colourPrimaries,
    'Transfer Characteristics': metadata.transferCharacteristics,
    'Matrix Coefficients': metadata.matrixCoefficients,
    'Mastering Display Primaries': metadata.masteringDisplayColorPrimaries,
    'Mastering Display Luminance': metadata.masteringDisplayLuminance,
    'MaxCLL': metadata.maxCLL,
    'MaxFALL': metadata.maxFALL,
  };

  const audioFields = {
    Codec: metadata.audioCodec,
    'Codec ID': metadata.audioCodecID,
    Profile: metadata.audioFormatProfile,
    Bitrate: metadata.audioBitRate ? `${(metadata.audioBitRate / 1000).toFixed(0)} kbps` : null,
    'Bitrate Mode': metadata.audioBitRateMode,
    Channels: metadata.audioChannels,
    'Channel Layout': metadata.audioChannelLayout,
    'Sampling Rate': metadata.audioSamplingRate ? `${metadata.audioSamplingRate} Hz` : null,
    'Bit Depth': metadata.audioBitDepth ? `${metadata.audioBitDepth}-bit` : null,
    Language: metadata.audioLanguage,
    'Compression Mode': metadata.audioCompressionMode,
  };

  const containerFields = {
    Container: metadata.container,
    'File Size': `${(metadata.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB (${metadata.fileSize.toLocaleString()} bytes)`,
    Duration: metadata.duration ? `${Math.floor(metadata.duration / 60)}m ${Math.floor(metadata.duration % 60)}s` : null,
    'Overall Bitrate': metadata.overallBitRate ? `${(metadata.overallBitRate / 1000000).toFixed(2)} Mbps` : null,
    'Overall Bitrate Mode': metadata.overallBitRateMode,
    'Writing Application': metadata.writingApplication,
    'Writing Library': metadata.writingLibrary,
  };

  return (
    <div className="mt-3 border border-gray-700 rounded-lg bg-gray-800/30 overflow-hidden">
      <div className="border-b border-gray-700 bg-gray-800/50 px-3 py-2">
        <h4 className="text-sm font-medium text-gray-200">{label} - Full Details</h4>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-800/20 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/40' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-80 overflow-y-auto">
        {activeTab === 'video' && (
          <div className="space-y-1">
            {renderKeyValuePairs(videoFields as Record<string, any>)}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-1">
            {renderKeyValuePairs(audioFields as Record<string, any>)}
          </div>
        )}

        {activeTab === 'hdr' && (
          <div className="space-y-1">
            {Object.values(hdrFields).every(v => !v) ? (
              <p className="text-gray-500 text-xs text-center py-4">No HDR metadata detected</p>
            ) : (
              renderKeyValuePairs(hdrFields as Record<string, any>)
            )}
          </div>
        )}

        {activeTab === 'container' && (
          <div className="space-y-1">
            {renderKeyValuePairs(containerFields as Record<string, any>)}
          </div>
        )}

        {activeTab === 'raw' && (
          <pre className="text-xs text-gray-300 overflow-auto max-h-64 bg-gray-900/50 p-2 rounded border border-gray-700">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}