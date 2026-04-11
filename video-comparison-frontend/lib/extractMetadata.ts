// lib/extractMetadata.ts
import MediaInfoFactory from 'mediainfo.js';
import { UltimateVideoMetadata, GeneralTrack, VideoTrack, AudioTrack, TextTrack } from './mediaTypes';

export interface VideoMetadata {
  fileName: string;
  fileSize: number;
  container: string;
  videoCodec: string;
  resolution: string;
  width: number;
  height: number;
  frameRate: number | null;
  bitrate: number | null;
  bitDepth: number | null;
  colorSpace: string | null;
  audioCodec: string | null;
  duration: number | null;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB

// Main export for backward compatibility
export async function extractMetadata(file: File): Promise<VideoMetadata> {
  const ultimate = await extractUltimateMetadata(file);
  // Convert to simplified format for existing components
  const videoTrack = ultimate.video[0] || {};
  const audioTrack = ultimate.audio[0] || {};
  const general = ultimate.general || {};

  const parseNum = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(String(val));
    return isNaN(num) ? null : num;
  };

  const bitDepthMatch = String(videoTrack.BitDepth || videoTrack.Format_Settings || '').match(/(\d+)[ -]?bit/i);
  const bitDepth = bitDepthMatch ? parseInt(bitDepthMatch[1], 10) : null;

  return {
    fileName: file.name,
    fileSize: file.size,
    container: String(general.Format || 'Unknown'),
    videoCodec: String(videoTrack.Format || videoTrack.CodecID || 'Unknown'),
    resolution: `${videoTrack.Width || '?'}x${videoTrack.Height || '?'}`,
    width: parseNum(videoTrack.Width) || 0,
    height: parseNum(videoTrack.Height) || 0,
    frameRate: parseNum(videoTrack.FrameRate),
    bitrate: parseNum(general.OverallBitRate || videoTrack.BitRate),
    bitDepth,
    colorSpace: videoTrack.ColorSpace || null,
    audioCodec: audioTrack.Format || audioTrack.CodecID || null,
    duration: parseNum(general.Duration),
  };
}

// Ultimate extraction - returns all tracks
export async function extractUltimateMetadata(file: File): Promise<UltimateVideoMetadata> {
  const mediaInfo = await MediaInfoFactory({
    format: 'object',
    chunkSize: CHUNK_SIZE,
    locateFile: () => '/MediaInfoModule.wasm',
  });

  const readChunk = async (size: number, offset: number): Promise<Uint8Array> => {
    const end = Math.min(offset + size, file.size);
    const blob = file.slice(offset, end);
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  };

  try {
    const result = await mediaInfo.analyzeData(() => file.size, readChunk);
    return parseUltimateResult(result);
  } catch (error) {
    console.error('MediaInfo error:', error);
    throw new Error(`Failed to extract metadata: ${error}`);
  } finally {
    mediaInfo.close();
  }
}

function parseUltimateResult(rawResult: any): UltimateVideoMetadata {
  const tracks = rawResult.media?.track || [];

  const general = tracks.find((t: any) => t['@type'] === 'General') || null;
  const video = tracks.filter((t: any) => t['@type'] === 'Video') as VideoTrack[];
  const audio = tracks.filter((t: any) => t['@type'] === 'Audio') as AudioTrack[];
  const text = tracks.filter((t: any) => t['@type'] === 'Text') as TextTrack[];

  // Sanitize audio track keys (MediaInfo uses "Channel(s)" with parentheses)
  const sanitizedAudio = audio.map(track => {
    const newTrack: any = { ...track };
    if ('Channel(s)' in track) {
      newTrack.Channel_s_ = track['Channel(s)'];
      delete newTrack['Channel(s)'];
    }
    return newTrack as AudioTrack;
  });

  return {
    general: general as GeneralTrack,
    video: video as VideoTrack[],
    audio: sanitizedAudio,
    text: text as TextTrack[],
    raw: rawResult,
  };
}