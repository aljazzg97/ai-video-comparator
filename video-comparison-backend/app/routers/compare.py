import os
import json
import traceback
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from openai import OpenAI
from app.models import CompareRequest, CompareResponse

load_dotenv()

# Define the router - THIS WAS MISSING
router = APIRouter(prefix="/api", tags=["compare"])

# Set this to True to bypass OpenAI and use mock responses (free)
USE_MOCK = True  # Change to False when you have OpenAI credits

# Initialize OpenAI client (only if not using mock)
client = None if USE_MOCK else OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are an elite Video Compression Engineer and Codec Expert with deep knowledge of video/audio codecs, color science, and container formats. You will receive technical metadata for two video files. Your job is to provide a deeply technical comparison, determining which file offers the best balance of visual quality, storage efficiency, and audio fidelity.

Prioritize:
- Video Codec Efficiency: AV1 > HEVC/H.265 > VP9 > AVC/H.264
- Bit Depth & Chroma Subsampling: 10-bit 4:2:2 > 10-bit 4:2:0 > 8-bit 4:2:0 (10-bit reduces banding)
- Bitrate Management: VBR over CBR; lower bitrate with modern codec often beats higher bitrate with old codec.
- Audio Codec Quality: FLAC/PCM (lossless) > Opus > AAC > MP3. Higher bitrate audio is better.
- Container Format Capabilities: MKV is more flexible; MP4 is more compatible.

Do not just look at file size or bitrate. Analyze the combination of codec, bit depth, resolution, frame rate, and audio.

Return your analysis in strict JSON format with the following keys:
"winner" (either "Video A", "Video B", or "Tie"),
"summary" (a 2-sentence high-level explanation),
"pros_a" (list of strings),
"cons_a" (list of strings),
"pros_b" (list of strings),
"cons_b" (list of strings),
"technical_verdict" (a detailed, multi-paragraph technical breakdown explaining the codec science, color science, and audio engineering behind your choice. Include specific observations about bitrate efficiency, color depth advantages, and audio quality.)
"""

def generate_mock_response(request: CompareRequest) -> CompareResponse:
    """Generate a realistic mock analysis based on metadata."""
    v1 = request.video_a
    v2 = request.video_b

    # Simple heuristic scoring
    score_a = 0
    score_b = 0

    # Codec ranking
    codec_rank = {"AV1": 4, "HEVC": 3, "H265": 3, "AVC": 2, "H264": 2, "VP9": 3}
    score_a += codec_rank.get(v1.videoCodec.upper(), 1)
    score_b += codec_rank.get(v2.videoCodec.upper(), 1)

    # Bit depth bonus
    if v1.bitDepth and v1.bitDepth >= 10:
        score_a += 1
    if v2.bitDepth and v2.bitDepth >= 10:
        score_b += 1

    # Efficiency: lower bits per pixel is better
    if v1.bitrate and v2.bitrate and v1.width and v2.width:
        bpp_a = v1.bitrate / (v1.width * v1.height)
        bpp_b = v2.bitrate / (v2.width * v2.height)
        if bpp_a < bpp_b:
            score_a += 1
        else:
            score_b += 1

    if score_a > score_b:
        winner = "Video A"
        pros_a = [f"Uses {v1.videoCodec} codec", "Better compression efficiency"]
        cons_a = ["Larger file size"] if v1.fileSize > v2.fileSize else ["Higher bitrate than necessary"]
        pros_b = [f"Uses {v2.videoCodec} codec", "Smaller file size"]
        cons_b = ["Lower bit depth may cause banding" if (v2.bitDepth or 8) < 10 else "Standard quality"]
        technical = f"Video A's {v1.videoCodec} encoding with {v1.bitDepth or 8}-bit depth provides superior visual fidelity."
    elif score_b > score_a:
        winner = "Video B"
        pros_a = [f"Uses {v1.videoCodec} codec", "Adequate quality"]
        cons_a = ["Less efficient compression"]
        pros_b = [f"Uses {v2.videoCodec} codec", "Excellent efficiency", f"{v2.bitDepth or 8}-bit color"]
        cons_b = ["May require modern hardware"]
        technical = f"Video B leverages {v2.videoCodec} which offers roughly 50% better compression than older codecs."
    else:
        winner = "Tie"
        pros_a = ["Good quality"]
        cons_a = ["Nothing exceptional"]
        pros_b = ["Good quality"]
        cons_b = ["Nothing exceptional"]
        technical = "Both videos offer similar quality and efficiency."

    return CompareResponse(
        winner=winner,
        summary=f"Based on codec efficiency and bitrate analysis, {winner} provides the best balance of quality and file size.",
        pros_a=pros_a,
        cons_a=cons_a,
        pros_b=pros_b,
        cons_b=cons_b,
        technical_verdict=technical
    )

@router.post("/compare", response_model=CompareResponse)
async def compare_videos(request: CompareRequest):
    # Mock mode
    if USE_MOCK:
        return generate_mock_response(request)

    # Real OpenAI mode
    user_message = f"""
Video A Metadata:
- File Name: {request.video_a.fileName}
- File Size: {request.video_a.fileSize / (1024*1024):.2f} MB
- Container: {request.video_a.container}
- Video Codec: {request.video_a.videoCodec}
- Resolution: {request.video_a.resolution} ({request.video_a.width}x{request.video_a.height})
- Frame Rate: {request.video_a.frameRate} fps
- Bitrate: {request.video_a.bitrate} kbps if available else N/A
- Bit Depth: {request.video_a.bitDepth}-bit if available else N/A
- Color Space: {request.video_a.colorSpace}
- Audio Codec: {request.video_a.audioCodec}
- Duration: {request.video_a.duration} seconds if available else N/A

Video B Metadata:
- File Name: {request.video_b.fileName}
- File Size: {request.video_b.fileSize / (1024*1024):.2f} MB
- Container: {request.video_b.container}
- Video Codec: {request.video_b.videoCodec}
- Resolution: {request.video_b.resolution} ({request.video_b.width}x{request.video_b.height})
- Frame Rate: {request.video_b.frameRate} fps
- Bitrate: {request.video_b.bitrate} kbps if available else N/A
- Bit Depth: {request.video_b.bitDepth}-bit if available else N/A
- Color Space: {request.video_b.colorSpace}
- Audio Codec: {request.video_b.audioCodec}
- Duration: {request.video_b.duration} seconds if available else N/A

Please analyze these two videos according to your expertise and return the JSON response exactly as specified.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        ai_output = response.choices[0].message.content
        if not ai_output:
            raise HTTPException(status_code=500, detail="OpenAI returned empty response")

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
        print("ERROR CALLING OPENAI:")
        traceback.print_exc()
        print("=" * 50)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")