from pydantic import BaseModel
from typing import Optional

class VideoMetadata(BaseModel):
    fileName: str
    fileSize: int
    container: str
    videoCodec: str
    resolution: str
    width: int
    height: int
    frameRate: Optional[float] = None
    bitrate: Optional[float] = None
    bitDepth: Optional[int] = None
    colorSpace: Optional[str] = None
    audioCodec: Optional[str] = None
    duration: Optional[float] = None

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