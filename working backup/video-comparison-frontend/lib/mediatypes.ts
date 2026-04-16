// lib/mediaTypes.ts
export interface TrackBase {
  '@type': string;
  ID?: string;
  StreamOrder?: string;
  Format?: string;
  Format_Info?: string;
  Format_Url?: string;
  Format_Commercial?: string;
  Format_Profile?: string;
  Format_Level?: string;
  Format_Settings?: string;
  Title?: string;
  Language?: string;
  Default?: string;
  Forced?: string;
}

export interface GeneralTrack extends TrackBase {
  CompleteName?: string;
  FileSize?: string;
  Duration?: string;
  OverallBitRate?: string;
  OverallBitRate_Mode?: string; // VBR/CBR
  FrameRate?: string;
  FrameCount?: string;
  StreamSize?: string;
  IsStreamable?: string;
  Movie?: string;
  Album?: string;
  Track?: string;
  Performer?: string;
  Genre?: string;
  Recorded_Date?: string;
  Encoded_Date?: string;
  Tagged_Date?: string;
  Writing_Application?: string;
  Writing_Library?: string;
}

export interface VideoTrack extends TrackBase {
  Width?: string;
  Height?: string;
  DisplayAspectRatio?: string;
  PixelAspectRatio?: string;
  FrameRate?: string;
  FrameRate_Mode?: string;
  FrameCount?: string;
  ColorSpace?: string;
  ChromaSubsampling?: string;
  BitDepth?: string;
  ScanType?: string; // Progressive/Interlaced
  ScanOrder?: string;
  Compression_Mode?: string;
  BitRate?: string;
  BitRate_Mode?: string;
  Encoded_Library?: string;
  Encoded_Library_Settings?: string;
  CodecID?: string;
  CodecID_Info?: string;
}

export interface AudioTrack extends TrackBase {
  Format?: string;
  Format_Info?: string;
  Format_Profile?: string;
  CodecID?: string;
  Duration?: string;
  BitRate?: string;
  BitRate_Mode?: string;
  Channel(s)?: string;
  ChannelPositions?: string;
  SamplingRate?: string;
  SamplingCount?: string;
  FrameRate?: string;
  Compression_Mode?: string;
  Language?: string;
  Default?: string;
  Forced?: string;
}

export interface TextTrack extends TrackBase {
  Format?: string;
  CodecID?: string;
  Language?: string;
  Default?: string;
  Forced?: string;
}

export interface UltimateVideoMetadata {
  general: GeneralTrack | null;
  video: VideoTrack[];
  audio: AudioTrack[];
  text: TextTrack[];
  // You can also add 'menu', 'image' etc. as needed
}