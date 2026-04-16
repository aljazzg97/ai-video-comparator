"use client";

import { VideoMetadata } from "@/lib/extractMetadata";
import { Fragment } from 'react';


interface ComparisonTableProps {
  metadataA: VideoMetadata;
  metadataB: VideoMetadata;
  videoAName: string;
  videoBName: string;
}

interface MetricRow {
  label: string;
  valueA: string | number;
  valueB: string | number;
  better: "A" | "B" | "tie" | null;
  tooltip?: string;
  category?: string;
}

export default function ComparisonTable({ metadataA, metadataB, videoAName, videoBName }: ComparisonTableProps) {
  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Helper to format bitrate
  const formatBitrate = (bitrate: number | null): string => {
    if (bitrate === null) return "N/A";
    if (bitrate >= 1000000) {
      return (bitrate / 1000000).toFixed(1) + " Mbps";
    } else if (bitrate >= 1000) {
      return (bitrate / 1000).toFixed(0) + " kbps";
    } else {
      return bitrate.toFixed(0) + " bps";
    }
  };

  // Helper to format duration
  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Evaluate which value is better based on metric type
  const evaluateBetter = (metric: string, valA: any, valB: any): "A" | "B" | "tie" | null => {
    if (valA === null || valB === null || valA === undefined || valB === undefined) return null;
    if (valA === valB) return "tie";

    const numA = typeof valA === "number" ? valA : parseFloat(valA);
    const numB = typeof valB === "number" ? valB : parseFloat(valB);

    if (!isNaN(numA) && !isNaN(numB)) {
      switch (metric) {
        case "fileSize": return numA < numB ? "A" : "B";
        case "audioBitrate": return numA > numB ? "A" : "B";
        case "bitDepth": return numA > numB ? "A" : "B";
        case "width":
        case "height": return numA > numB ? "A" : "B";
        case "frameRate": return numA > numB ? "A" : "B";
        case "audioChannels": return numA > numB ? "A" : "B";
        case "audioSamplingRate": return numA > numB ? "A" : "B";
        default: return null;
      }
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    if (metric === "hdrFormat") {
      const rank: Record<string, number> = {
        "dolby vision": 4, "hdr10+": 3, "hdr10": 2, "hlg": 1, "sdr": 0,
      };
      const scoreA = Object.entries(rank).find(([k]) => strA.includes(k))?.[1] || 0;
      const scoreB = Object.entries(rank).find(([k]) => strB.includes(k))?.[1] || 0;
      if (scoreA === scoreB) return "tie";
      return scoreA > scoreB ? "A" : "B";
    }

    if (metric === "colourPrimaries") {
      const rank: Record<string, number> = {
        "bt.2020": 4, "dci-p3": 3, "bt.709": 2, "smpte 240m": 1,
      };
      const scoreA = Object.entries(rank).find(([k]) => strA.includes(k))?.[1] || 0;
      const scoreB = Object.entries(rank).find(([k]) => strB.includes(k))?.[1] || 0;
      if (scoreA === scoreB) return "tie";
      return scoreA > scoreB ? "A" : "B";
    }

    if (metric === "transferCharacteristics") {
      const rank: Record<string, number> = {
        "pq": 4, "hlg": 3, "bt.709": 2, "bt.1886": 1,
      };
      const scoreA = Object.entries(rank).find(([k]) => strA.includes(k))?.[1] || 0;
      const scoreB = Object.entries(rank).find(([k]) => strB.includes(k))?.[1] || 0;
      if (scoreA === scoreB) return "tie";
      return scoreA > scoreB ? "A" : "B";
    }

    if (metric === "chromaSubsampling") {
      const rank: Record<string, number> = {
        "4:4:4": 4, "4:2:2": 3, "4:2:0": 2, "4:1:1": 1,
      };
      const scoreA = rank[strA] || 0;
      const scoreB = rank[strB] || 0;
      if (scoreA === scoreB) return "tie";
      return scoreA > scoreB ? "A" : "B";
    }

    if (metric === "audioCodec") {
      const rank: Record<string, number> = {
        "flac": 5, "pcm": 5, "truehd": 5, "dts-hd ma": 5,
        "opus": 4, "aac": 3, "ac-3": 2, "mp3": 1,
      };
      const scoreA = Object.entries(rank).find(([k]) => strA.includes(k))?.[1] || 0;
      const scoreB = Object.entries(rank).find(([k]) => strB.includes(k))?.[1] || 0;
      if (scoreA === scoreB) return "tie";
      return scoreA > scoreB ? "A" : "B";
    }

    return null;
  };

  // Build rows with categories
  const rows: MetricRow[] = [
    // Container & File
    { label: "Container", valueA: metadataA.container, valueB: metadataB.container, better: null, category: "General" },
    { label: "File Size", valueA: formatFileSize(metadataA.fileSize), valueB: formatFileSize(metadataB.fileSize), better: evaluateBetter("fileSize", metadataA.fileSize, metadataB.fileSize), tooltip: "Smaller file size saves storage/bandwidth", category: "General" },
    { label: "Duration", valueA: formatDuration(metadataA.duration), valueB: formatDuration(metadataB.duration), better: null, category: "General" },
    { label: "Overall Bitrate", valueA: formatBitrate(metadataA.overallBitRate), valueB: formatBitrate(metadataB.overallBitRate), better: null, category: "General" },
    
    // Video Codec
    { label: "Video Codec", valueA: metadataA.videoCodec, valueB: metadataB.videoCodec, better: null, category: "Video" },
    { label: "Profile", valueA: metadataA.videoFormatProfile || "N/A", valueB: metadataB.videoFormatProfile || "N/A", better: null, category: "Video" },
    { label: "Level", valueA: metadataA.videoFormatLevel || "N/A", valueB: metadataB.videoFormatLevel || "N/A", better: null, category: "Video" },
    { label: "Resolution", valueA: metadataA.resolution, valueB: metadataB.resolution, better: evaluateBetter("width", metadataA.width, metadataB.width), category: "Video" },
    { label: "Frame Rate", valueA: metadataA.frameRate ? `${metadataA.frameRate.toFixed(3)} fps` : "N/A", valueB: metadataB.frameRate ? `${metadataB.frameRate.toFixed(3)} fps` : "N/A", better: evaluateBetter("frameRate", metadataA.frameRate, metadataB.frameRate), category: "Video" },
    { label: "Frame Rate Mode", valueA: metadataA.frameRateMode || "N/A", valueB: metadataB.frameRateMode || "N/A", better: null, category: "Video" },
    { label: "Bit Depth", valueA: metadataA.bitDepth ? `${metadataA.bitDepth}-bit` : "N/A", valueB: metadataB.bitDepth ? `${metadataB.bitDepth}-bit` : "N/A", better: evaluateBetter("bitDepth", metadataA.bitDepth, metadataB.bitDepth), tooltip: "Higher bit depth reduces banding", category: "Video" },
    { label: "Chroma Subsampling", valueA: metadataA.chromaSubsampling || "N/A", valueB: metadataB.chromaSubsampling || "N/A", better: evaluateBetter("chromaSubsampling", metadataA.chromaSubsampling, metadataB.chromaSubsampling), tooltip: "4:4:4 > 4:2:2 > 4:2:0", category: "Video" },
    { label: "Video Bitrate", valueA: formatBitrate(metadataA.bitRate), valueB: formatBitrate(metadataB.bitRate), better: null, category: "Video" },
    
    // HDR / Color
    { label: "HDR Format", valueA: metadataA.hdrFormat || "SDR", valueB: metadataB.hdrFormat || "SDR", better: evaluateBetter("hdrFormat", metadataA.hdrFormat || "SDR", metadataB.hdrFormat || "SDR"), tooltip: "Dolby Vision > HDR10+ > HDR10 > HLG > SDR", category: "HDR" },
    { label: "Color Primaries", valueA: metadataA.colourPrimaries || "N/A", valueB: metadataB.colourPrimaries || "N/A", better: evaluateBetter("colourPrimaries", metadataA.colourPrimaries, metadataB.colourPrimaries), tooltip: "BT.2020 > DCI-P3 > BT.709", category: "HDR" },
    { label: "Transfer Characteristics", valueA: metadataA.transferCharacteristics || "N/A", valueB: metadataB.transferCharacteristics || "N/A", better: evaluateBetter("transferCharacteristics", metadataA.transferCharacteristics, metadataB.transferCharacteristics), tooltip: "PQ / HLG > SDR", category: "HDR" },
    { label: "Matrix Coefficients", valueA: metadataA.matrixCoefficients || "N/A", valueB: metadataB.matrixCoefficients || "N/A", better: null, category: "HDR" },
    { label: "Mastering Display Luminance", valueA: metadataA.masteringDisplayLuminance || "N/A", valueB: metadataB.masteringDisplayLuminance || "N/A", better: null, category: "HDR" },
    { label: "MaxCLL", valueA: metadataA.maxCLL || "N/A", valueB: metadataB.maxCLL || "N/A", better: null, tooltip: "Maximum Content Light Level", category: "HDR" },
    { label: "MaxFALL", valueA: metadataA.maxFALL || "N/A", valueB: metadataB.maxFALL || "N/A", better: null, tooltip: "Maximum Frame-Average Light Level", category: "HDR" },
    
    // Audio
    { label: "Audio Codec", valueA: metadataA.audioCodec || "N/A", valueB: metadataB.audioCodec || "N/A", better: evaluateBetter("audioCodec", metadataA.audioCodec, metadataB.audioCodec), tooltip: "Lossless > High-bitrate lossy", category: "Audio" },
    { label: "Audio Bitrate", valueA: formatBitrate(metadataA.audioBitRate), valueB: formatBitrate(metadataB.audioBitRate), better: evaluateBetter("audioBitrate", metadataA.audioBitRate, metadataB.audioBitRate), category: "Audio" },
    { label: "Audio Channels", valueA: metadataA.audioChannels || "N/A", valueB: metadataB.audioChannels || "N/A", better: evaluateBetter("audioChannels", metadataA.audioChannels, metadataB.audioChannels), category: "Audio" },
    { label: "Sampling Rate", valueA: metadataA.audioSamplingRate ? `${(metadataA.audioSamplingRate / 1000).toFixed(1)} kHz` : "N/A", valueB: metadataB.audioSamplingRate ? `${(metadataB.audioSamplingRate / 1000).toFixed(1)} kHz` : "N/A", better: evaluateBetter("audioSamplingRate", metadataA.audioSamplingRate, metadataB.audioSamplingRate), category: "Audio" },
    { label: "Audio Bit Depth", valueA: metadataA.audioBitDepth ? `${metadataA.audioBitDepth}-bit` : "N/A", valueB: metadataB.audioBitDepth ? `${metadataB.audioBitDepth}-bit` : "N/A", better: evaluateBetter("bitDepth", metadataA.audioBitDepth, metadataB.audioBitDepth), category: "Audio" },
  ];

  const categories = Array.from(new Set(rows.map(r => r.category).filter(Boolean))) as string[];

  return (
    <div className="mt-8 rounded-lg border border-gray-700 bg-gray-800/30 overflow-hidden">
      <div className="border-b border-gray-700 bg-gray-800/50 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">Technical Comparison</h2>
        <p className="text-xs text-gray-400 mt-0.5">Green highlight indicates technically superior value</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/40">
              <th className="px-4 py-2 text-left text-gray-300 font-medium w-1/4">Parameter</th>
              <th className="px-4 py-2 text-left text-gray-300 font-medium">
                <span className="break-all line-clamp-2">{videoAName}</span>
              </th>
              <th className="px-4 py-2 text-left text-gray-300 font-medium">
                <span className="break-all line-clamp-2">{videoBName}</span>
              </th>
            </tr>
          </thead>
          <tbody>
  {categories.map(category => (
    <Fragment key={`cat-${category}`}>
      <tr className="bg-gray-800/60 border-b border-gray-700">
        <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-wider">
          {category}
        </td>
      </tr>
      {rows.filter(r => r.category === category).map((row, idx) => (
        <tr key={`${category}-${idx}`} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
          <td className="px-4 py-2.5 text-gray-300 font-medium whitespace-nowrap">
            {row.label}
            {row.tooltip && (
              <span className="ml-1 text-gray-500 cursor-help" title={row.tooltip}>ⓘ</span>
            )}
          </td>
          <td className={`px-4 py-2.5 text-gray-200 font-mono break-all ${row.better === "A" ? "bg-green-900/20 border-l-2 border-green-500" : ""}`}>
            {row.valueA}
          </td>
          <td className={`px-4 py-2.5 text-gray-200 font-mono break-all ${row.better === "B" ? "bg-green-900/20 border-l-2 border-green-500" : ""}`}>
            {row.valueB}
          </td>
        </tr>
      ))}
    </Fragment>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}