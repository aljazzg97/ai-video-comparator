from pydantic import BaseModel
from typing import Optional

class VideoMetadata(BaseModel):
    fileName: str
    fileSize: int
    container: str
    duration: Optional[float] = None
    overallBitRate: Optional[float] = None
    overallBitRateMode: Optional[str] = None
    writingApplication: Optional[str] = None
    writingLibrary: Optional[str] = None

    videoCodec: str
    videoCodecID: Optional[str] = None
    videoFormatProfile: Optional[str] = None
    videoFormatLevel: Optional[str] = None
    videoFormatTier: Optional[str] = None
    videoFormatSettings: Optional[str] = None
    hdrFormat: Optional[str] = None
    hdrFormatProfile: Optional[str] = None
    hdrFormatLevel: Optional[str] = None
    hdrFormatSettings: Optional[str] = None
    hdrFormatCompatibility: Optional[str] = None
    resolution: str
    width: int
    height: int
    displayAspectRatio: Optional[str] = None
    pixelAspectRatio: Optional[str] = None
    frameRate: Optional[float] = None
    frameRateMode: Optional[str] = None
    frameCount: Optional[int] = None
    bitDepth: Optional[int] = None
    chromaSubsampling: Optional[str] = None
    chromaSubsamplingPosition: Optional[str] = None
    colorSpace: Optional[str] = None
    colourRange: Optional[str] = None
    colourPrimaries: Optional[str] = None
    transferCharacteristics: Optional[str] = None
    matrixCoefficients: Optional[str] = None
    bitRate: Optional[float] = None
    bitRateMode: Optional[str] = None
    scanType: Optional[str] = None
    encodedLibrary: Optional[str] = None
    encodedLibrarySettings: Optional[str] = None
    delay: Optional[float] = None

    audioCodec: Optional[str] = None
    audioCodecID: Optional[str] = None
    audioFormatProfile: Optional[str] = None
    audioBitRate: Optional[float] = None
    audioBitRateMode: Optional[str] = None
    audioChannels: Optional[int] = None
    audioChannelLayout: Optional[str] = None
    audioSamplingRate: Optional[int] = None
    audioBitDepth: Optional[int] = None
    audioLanguage: Optional[str] = None
    audioCompressionMode: Optional[str] = None

    masteringDisplayColorPrimaries: Optional[str] = None
    masteringDisplayLuminance: Optional[str] = None
    maxCLL: Optional[str] = None
    maxFALL: Optional[str] = None

class CompareRequest(BaseModel):
    video_a: VideoMetadata
    video_b: VideoMetadata

class CompareResponse(BaseModel):
    winner: str
    summary: str
    pros_a: list[str]
    cons_a: list[str]
    pros_b: list[str]
    cons_b: list[str]
    technical_verdict: str