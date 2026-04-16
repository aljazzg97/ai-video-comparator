declare module "mediainfo.js" {
  export interface MediaInfo {
    analyzeData(
      getSize: () => number,
      readChunk: (chunkData: Uint8Array) => Promise<ArrayBuffer>
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
  }

  export default function MediaInfoFactory(
    options?: MediaInfoFactoryOptions
  ): Promise<MediaInfo>;
}