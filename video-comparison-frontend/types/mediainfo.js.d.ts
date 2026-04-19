declare module "mediainfo.js" {
  export interface MediaInfo {
    analyzeData(
      getSize: () => number,
      readChunk: (size: number, offset: number) => Promise<Uint8Array>
    ): Promise<any>;
    getInfo(): Promise<any>;
    close(): void;
  }

  export type ReadChunkFunc = (size: number, offset: number) => Blob;

  export interface MediaInfoFactoryOptions {
    format?: "object" | "text" | "html" | "json";
    chunkSize?: number;
    coverData?: boolean;
    full?: boolean;
    locateFile?: (path: string) => string;  // <-- ADD THIS LINE
  }

  export default function MediaInfoFactory(
    options?: MediaInfoFactoryOptions
  ): Promise<MediaInfo>;
}