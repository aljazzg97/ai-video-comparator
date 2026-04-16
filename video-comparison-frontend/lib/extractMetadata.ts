import MediaInfoFactory from 'mediainfo.js';

export interface VideoMetadata {
  fileName: string;
  fileSize: number;
  container: string;
  duration: number | null;
  overallBitRate: number | null;
  overallBitRateMode: string | null;
  writingApplication: string | null;
  writingLibrary: string | null;

  // Video
  videoCodec: string;
  videoCodecID: string | null;
  videoFormatProfile: string | null;
  videoFormatLevel: string | null;
  videoFormatTier: string | null;
  videoFormatSettings: string | null;
  hdrFormat: string | null;
  hdrFormatProfile: string | null;
  hdrFormatLevel: string | null;
  hdrFormatSettings: string | null;
  hdrFormatCompatibility: string | null;
  resolution: string;
  width: number;
  height: number;
  displayAspectRatio: string | null;
  pixelAspectRatio: string | null;
  frameRate: number | null;
  frameRateMode: string | null;
  frameCount: number | null;
  bitDepth: number | null;
  chromaSubsampling: string | null;
  chromaSubsamplingPosition: string | null;
  colorSpace: string | null;
  colourRange: string | null;
  colourPrimaries: string | null;
  transferCharacteristics: string | null;
  matrixCoefficients: string | null;
  bitRate: number | null;
  bitRateMode: string | null;
  scanType: string | null;
  encodedLibrary: string | null;
  encodedLibrarySettings: string | null;
  delay: number | null;

  // Audio (first track)
  audioCodec: string | null;
  audioCodecID: string | null;
  audioFormatProfile: string | null;
  audioBitRate: number | null;
  audioBitRateMode: string | null;
  audioChannels: number | null;
  audioChannelLayout: string | null;
  audioSamplingRate: number | null;
  audioBitDepth: number | null;
  audioLanguage: string | null;
  audioCompressionMode: string | null;

  // HDR Mastering Display
  masteringDisplayColorPrimaries: string | null;
  masteringDisplayLuminance: string | null;
  maxCLL: string | null;
  maxFALL: string | null;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB

export async function extractMetadata(file: File): Promise<VideoMetadata> {
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

  let result: any;
  try {
    result = await mediaInfo.analyzeData(() => file.size, readChunk);
  } catch (error) {
    console.error('MediaInfo error:', error);
    throw new Error(`Failed to extract metadata: ${error}`);
  } finally {
    mediaInfo.close();
  }

  return parseMetadataResult(result, file);
}

// Keep debug function for future use
export async function debugExtractAllFields(file: File): Promise<any> {
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

  let result: any;
  try {
    result = await mediaInfo.analyzeData(() => file.size, readChunk);
  } finally {
    mediaInfo.close();
  }

  console.log('=== FULL MEDIAINFO RESULT ===');
  console.log(JSON.stringify(result, null, 2));

  const tracks = result.media?.track || [];
  const video = tracks.find((t: any) => t['@type'] === 'Video');
  if (video) {
    console.log('=== ALL VIDEO TRACK KEYS ===');
    console.log(Object.keys(video).sort());
  }

  return result;
}

function parseMetadataResult(result: any, file: File): VideoMetadata {
  const tracks = result.media?.track || [];
  const general = tracks.find((t: any) => t['@type'] === 'General') || {};
  const video = tracks.find((t: any) => t['@type'] === 'Video') || {};
  const audio = tracks.find((t: any) => t['@type'] === 'Audio') || {};

  const getString = (val: any): string | null => {
    if (val === null || val === undefined) return null;
    return String(val);
  };

  const parseNumber = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(String(val));
    return isNaN(num) ? null : num;
  };

  return {
    fileName: file.name,
    fileSize: file.size,
    container: getString(general.Format) || 'Unknown',
    duration: parseNumber(general.Duration),
    overallBitRate: parseNumber(general.OverallBitRate),
    overallBitRateMode: getString(general.OverallBitRate_Mode),
    writingApplication: getString(general.Encoded_Application) || getString(general.Writing_Application),
    writingLibrary: getString(general.Encoded_Library) || getString(general.Writing_Library),

    videoCodec: getString(video.Format) || getString(video.CodecID) || 'Unknown',
    videoCodecID: getString(video.CodecID),
    videoFormatProfile: getString(video.Format_Profile),
    videoFormatLevel: getString(video.Format_Level),
    videoFormatTier: getString(video.Format_Tier),
    videoFormatSettings: getString(video.Format_Settings),
    hdrFormat: getString(video.HDR_Format),
    hdrFormatProfile: getString(video.HDR_Format_Profile),
    hdrFormatLevel: getString(video.HDR_Format_Level),
    hdrFormatSettings: getString(video.HDR_Format_Settings),
    hdrFormatCompatibility: getString(video.HDR_Format_Compatibility),
    resolution: `${getString(video.Width) || '?'}x${getString(video.Height) || '?'}`,
    width: parseNumber(video.Width) || 0,
    height: parseNumber(video.Height) || 0,
    displayAspectRatio: getString(video.DisplayAspectRatio),
    pixelAspectRatio: getString(video.PixelAspectRatio),
    frameRate: parseNumber(video.FrameRate),
    frameRateMode: getString(video.FrameRate_Mode),
    frameCount: parseNumber(video.FrameCount),
    bitDepth: parseNumber(video.BitDepth),
    chromaSubsampling: getString(video.ChromaSubsampling),
    chromaSubsamplingPosition: getString(video.ChromaSubsampling_Position),
    colorSpace: getString(video.ColorSpace),
    colourRange: getString(video.colour_range),
    colourPrimaries: getString(video.colour_primaries),
    transferCharacteristics: getString(video.transfer_characteristics),
    matrixCoefficients: getString(video.matrix_coefficients),
    bitRate: parseNumber(video.BitRate) || parseNumber(general.OverallBitRate),
    bitRateMode: getString(video.BitRate_Mode) || getString(general.OverallBitRate_Mode),
    scanType: getString(video.ScanType),
    encodedLibrary: getString(video.Encoded_Library),
    encodedLibrarySettings: getString(video.Encoded_Library_Settings),
    delay: parseNumber(video.Delay),

    audioCodec: getString(audio.Format) || getString(audio.CodecID),
    audioCodecID: getString(audio.CodecID),
    audioFormatProfile: getString(audio.Format_Profile),
    audioBitRate: parseNumber(audio.BitRate),
    audioBitRateMode: getString(audio.BitRate_Mode),
    audioChannels: parseNumber(audio.Channels),
    audioChannelLayout: getString(audio.ChannelLayout) || getString(audio.ChannelPositions),
    audioSamplingRate: parseNumber(audio.SamplingRate),
    audioBitDepth: parseNumber(audio.BitDepth),
    audioLanguage: getString(audio.Language),
    audioCompressionMode: getString(audio.Compression_Mode),

    masteringDisplayColorPrimaries: getString(video.MasteringDisplay_ColorPrimaries),
    masteringDisplayLuminance: getString(video.MasteringDisplay_Luminance),
    maxCLL: getString(video.MaxCLL),
    maxFALL: getString(video.MaxFALL),
  };
}

// Attach debug function to window for console access
if (typeof window !== 'undefined') {
  // Delay attachment until after initial render to avoid router conflicts
  setTimeout(() => {
    (window as any).debugExtractAllFields = debugExtractAllFields;
  }, 0);
}