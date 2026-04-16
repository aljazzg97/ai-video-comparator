import os
import json
import traceback
from pathlib import Path
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from groq import Groq
from app.models import CompareRequest, CompareResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

# Load .env from backend root
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / '.env'
print(f"Looking for .env at: {env_path}")
load_dotenv(dotenv_path=env_path)

# Define the router
router = APIRouter(prefix="/api", tags=["compare"])


# Get Groq API key
api_key = os.getenv("GROQ_API_KEY")
print(f"GROQ_API_KEY loaded: {'Yes' if api_key else 'No'}")

if not api_key:
    raise ValueError(f"GROQ_API_KEY not found. Checked file: {env_path}")

client = Groq(api_key=api_key)

SYSTEM_PROMPT = """You are a world-class Video Quality Engineer and Color Scientist specializing in codec evaluation for professional mastering and archival. Your analysis must prioritize **visual quality** above all else—file size and bitrate are secondary considerations.

You will receive comprehensive technical metadata for two video files, including HDR formats, color primaries, transfer characteristics, and mastering display data.

**Critical Output Requirements:**
- In the `summary`, you MUST explicitly state the **2-3 most important technical features** that make the winner superior (e.g., "Video A wins due to Dolby Vision HDR, 10-bit HEVC encoding, and FLAC 7.1 audio").
- In the `technical_verdict`, provide a structured comparison covering:
  - **Codec & Compression**: Compare profiles, levels, and encoding efficiency.
  - **Color & Dynamic Range**: Compare bit depth, chroma subsampling, color primaries, transfer functions, and HDR metadata (MaxCLL, MaxFALL).
  - **Audio Quality**: Compare codecs, bitrates, channels, and lossless/lossy nature.
  - **Container & Streaming**: Note any advantages of the container format.
- The `pros_a` and `pros_b` lists should each contain at least one specific technical strength (e.g., "10-bit color depth reduces banding").

**Evaluation Priorities (weighted):**
1. **HDR & Color Science** (30%): Dolby Vision > HDR10+ > HDR10 > HLG > SDR. Prefer BT.2020/DCI-P3 primaries, PQ/HLG transfer, and high MaxCLL/MaxFALL values.
2. **Codec & Compression Efficiency** (25%): AV1 > HEVC > VP9 > AVC. Within HEVC, Main 10 profile with high tier/level indicates better quality potential.
3. **Bit Depth & Chroma** (20%): 10-bit (or 12-bit) > 8-bit; 4:4:4 > 4:2:2 > 4:2:0.
4. **Audio Fidelity** (15%): Lossless (FLAC/PCM/TrueHD/DTS-HD) > high-bitrate lossy (Opus/AAC) > low-bitrate lossy.
5. **Resolution & Frame Rate** (10%): Higher resolution and frame rate are better if bitrate is sufficient.

**Important Guidelines:**
- Do not simply compare file sizes or raw bitrates. A lower-bitrate HEVC file often looks better than a higher-bitrate AVC file.
- A 10-bit 4:2:0 file usually outperforms an 8-bit 4:2:2 file due to better compression and banding reduction.
- If HDR metadata is present, it is a major quality indicator. Dolby Vision with high MaxCLL is premium.
- When values are missing, note the limitation but still provide a reasoned opinion.

**Output Format (Strict JSON):**
{
  "winner": "Video A" or "Video B" or "Tie",
  "summary": "Concise 2-sentence explanation that names the decisive technical features.",
  "pros_a": ["List of specific technical strengths for Video A"],
  "cons_a": ["List of weaknesses for Video A"],
  "pros_b": ["List of specific technical strengths for Video B"],
  "cons_b": ["List of weaknesses for Video B"],
  "technical_verdict": "Detailed multi-paragraph analysis covering Codec, Color/HDR, Audio, and Container, with explicit comparisons and reasons for the winner."
}
"""

@router.post("/compare", response_model=CompareResponse)
@limiter.limit("30/hour")
async def compare_videos(request: CompareRequest):
    # Build enriched user message with all available metadata
    user_message = f"""
Video A Metadata:
- File Name: {request.video_a.fileName}
- File Size: {request.video_a.fileSize / (1024*1024*1024):.2f} GB ({request.video_a.fileSize} bytes)
- Container: {request.video_a.container}
- Duration: {request.video_a.duration or 'N/A'} s
- Overall Bitrate: {request.video_a.overallBitRate or 'N/A'} bps
- Overall Bitrate Mode: {request.video_a.overallBitRateMode or 'N/A'}
- Writing Application: {request.video_a.writingApplication or 'N/A'}
- Writing Library: {request.video_a.writingLibrary or 'N/A'}

Video Track:
- Codec: {request.video_a.videoCodec}
- Codec ID: {request.video_a.videoCodecID or 'N/A'}
- Format Profile: {request.video_a.videoFormatProfile or 'N/A'}
- Format Level: {request.video_a.videoFormatLevel or 'N/A'}
- Format Tier: {request.video_a.videoFormatTier or 'N/A'}
- Format Settings: {request.video_a.videoFormatSettings or 'N/A'}
- Resolution: {request.video_a.resolution} ({request.video_a.width}x{request.video_a.height})
- Display Aspect Ratio: {request.video_a.displayAspectRatio or 'N/A'}
- Pixel Aspect Ratio: {request.video_a.pixelAspectRatio or 'N/A'}
- Frame Rate: {request.video_a.frameRate or 'N/A'} fps
- Frame Rate Mode: {request.video_a.frameRateMode or 'N/A'}
- Frame Count: {request.video_a.frameCount or 'N/A'}
- Bit Depth: {request.video_a.bitDepth or 'N/A'}-bit
- Chroma Subsampling: {request.video_a.chromaSubsampling or 'N/A'}
- Chroma Subsampling Position: {request.video_a.chromaSubsamplingPosition or 'N/A'}
- Color Space: {request.video_a.colorSpace or 'N/A'}
- Scan Type: {request.video_a.scanType or 'N/A'}
- Video Bitrate: {request.video_a.bitRate or 'N/A'} bps
- Video Bitrate Mode: {request.video_a.bitRateMode or 'N/A'}
- Delay: {request.video_a.delay or 'N/A'} ms
- Encoded Library: {request.video_a.encodedLibrary or 'N/A'}
- Encoded Library Settings: {request.video_a.encodedLibrarySettings or 'N/A'}

HDR / Color Metadata:
- HDR Format: {request.video_a.hdrFormat or 'None (SDR)'}
- HDR Format Profile: {request.video_a.hdrFormatProfile or 'N/A'}
- HDR Format Level: {request.video_a.hdrFormatLevel or 'N/A'}
- HDR Format Settings: {request.video_a.hdrFormatSettings or 'N/A'}
- HDR Format Compatibility: {request.video_a.hdrFormatCompatibility or 'N/A'}
- Color Range: {request.video_a.colourRange or 'N/A'}
- Color Primaries: {request.video_a.colourPrimaries or 'N/A'}
- Transfer Characteristics: {request.video_a.transferCharacteristics or 'N/A'}
- Matrix Coefficients: {request.video_a.matrixCoefficients or 'N/A'}
- Mastering Display Color Primaries: {request.video_a.masteringDisplayColorPrimaries or 'N/A'}
- Mastering Display Luminance: {request.video_a.masteringDisplayLuminance or 'N/A'}
- MaxCLL: {request.video_a.maxCLL or 'N/A'}
- MaxFALL: {request.video_a.maxFALL or 'N/A'}

Audio Track:
- Codec: {request.video_a.audioCodec or 'N/A'}
- Codec ID: {request.video_a.audioCodecID or 'N/A'}
- Format Profile: {request.video_a.audioFormatProfile or 'N/A'}
- Bitrate: {request.video_a.audioBitRate or 'N/A'} bps
- Bitrate Mode: {request.video_a.audioBitRateMode or 'N/A'}
- Channels: {request.video_a.audioChannels or 'N/A'}
- Channel Layout: {request.video_a.audioChannelLayout or 'N/A'}
- Sampling Rate: {request.video_a.audioSamplingRate or 'N/A'} Hz
- Bit Depth: {request.video_a.audioBitDepth or 'N/A'}-bit
- Language: {request.video_a.audioLanguage or 'N/A'}
- Compression Mode: {request.video_a.audioCompressionMode or 'N/A'}

Video B Metadata:
- File Name: {request.video_b.fileName}
- File Size: {request.video_b.fileSize / (1024*1024*1024):.2f} GB ({request.video_b.fileSize} bytes)
- Container: {request.video_b.container}
- Duration: {request.video_b.duration or 'N/A'} s
- Overall Bitrate: {request.video_b.overallBitRate or 'N/A'} bps
- Overall Bitrate Mode: {request.video_b.overallBitRateMode or 'N/A'}
- Writing Application: {request.video_b.writingApplication or 'N/A'}
- Writing Library: {request.video_b.writingLibrary or 'N/A'}

Video Track:
- Codec: {request.video_b.videoCodec}
- Codec ID: {request.video_b.videoCodecID or 'N/A'}
- Format Profile: {request.video_b.videoFormatProfile or 'N/A'}
- Format Level: {request.video_b.videoFormatLevel or 'N/A'}
- Format Tier: {request.video_b.videoFormatTier or 'N/A'}
- Format Settings: {request.video_b.videoFormatSettings or 'N/A'}
- Resolution: {request.video_b.resolution} ({request.video_b.width}x{request.video_b.height})
- Display Aspect Ratio: {request.video_b.displayAspectRatio or 'N/A'}
- Pixel Aspect Ratio: {request.video_b.pixelAspectRatio or 'N/A'}
- Frame Rate: {request.video_b.frameRate or 'N/A'} fps
- Frame Rate Mode: {request.video_b.frameRateMode or 'N/A'}
- Frame Count: {request.video_b.frameCount or 'N/A'}
- Bit Depth: {request.video_b.bitDepth or 'N/A'}-bit
- Chroma Subsampling: {request.video_b.chromaSubsampling or 'N/A'}
- Chroma Subsampling Position: {request.video_b.chromaSubsamplingPosition or 'N/A'}
- Color Space: {request.video_b.colorSpace or 'N/A'}
- Scan Type: {request.video_b.scanType or 'N/A'}
- Video Bitrate: {request.video_b.bitRate or 'N/A'} bps
- Video Bitrate Mode: {request.video_b.bitRateMode or 'N/A'}
- Delay: {request.video_b.delay or 'N/A'} ms
- Encoded Library: {request.video_b.encodedLibrary or 'N/A'}
- Encoded Library Settings: {request.video_b.encodedLibrarySettings or 'N/A'}

HDR / Color Metadata:
- HDR Format: {request.video_b.hdrFormat or 'None (SDR)'}
- HDR Format Profile: {request.video_b.hdrFormatProfile or 'N/A'}
- HDR Format Level: {request.video_b.hdrFormatLevel or 'N/A'}
- HDR Format Settings: {request.video_b.hdrFormatSettings or 'N/A'}
- HDR Format Compatibility: {request.video_b.hdrFormatCompatibility or 'N/A'}
- Color Range: {request.video_b.colourRange or 'N/A'}
- Color Primaries: {request.video_b.colourPrimaries or 'N/A'}
- Transfer Characteristics: {request.video_b.transferCharacteristics or 'N/A'}
- Matrix Coefficients: {request.video_b.matrixCoefficients or 'N/A'}
- Mastering Display Color Primaries: {request.video_b.masteringDisplayColorPrimaries or 'N/A'}
- Mastering Display Luminance: {request.video_b.masteringDisplayLuminance or 'N/A'}
- MaxCLL: {request.video_b.maxCLL or 'N/A'}
- MaxFALL: {request.video_b.maxFALL or 'N/A'}

Audio Track:
- Codec: {request.video_b.audioCodec or 'N/A'}
- Codec ID: {request.video_b.audioCodecID or 'N/A'}
- Format Profile: {request.video_b.audioFormatProfile or 'N/A'}
- Bitrate: {request.video_b.audioBitRate or 'N/A'} bps
- Bitrate Mode: {request.video_b.audioBitRateMode or 'N/A'}
- Channels: {request.video_b.audioChannels or 'N/A'}
- Channel Layout: {request.video_b.audioChannelLayout or 'N/A'}
- Sampling Rate: {request.video_b.audioSamplingRate or 'N/A'} Hz
- Bit Depth: {request.video_b.audioBitDepth or 'N/A'}-bit
- Language: {request.video_b.audioLanguage or 'N/A'}
- Compression Mode: {request.video_b.audioCompressionMode or 'N/A'}

Please analyze these two videos according to your expertise and return the JSON response exactly as specified. Focus on the decisive technical features that determine superior visual quality.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        ai_output = response.choices[0].message.content
        if not ai_output:
            raise HTTPException(status_code=500, detail="Groq returned empty response")

        parsed = json.loads(ai_output)

        required_keys = ["winner", "summary", "pros_a", "cons_a", "pros_b", "cons_b", "technical_verdict"]
        for key in required_keys:
            if key not in parsed:
                raise ValueError(f"Missing required key '{key}' in AI response")

        return CompareResponse(
            winner=parsed["winner"],
            summary=parsed["summary"],
            pros_a=parsed["pros_a"],
            cons_a=parsed["cons_a"],
            pros_b=parsed["pros_b"],
            cons_b=parsed["cons_b"],
            technical_verdict=parsed["technical_verdict"]
        )

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        print("=" * 50)
        print("ERROR CALLING GROQ:")
        traceback.print_exc()
        print("=" * 50)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")