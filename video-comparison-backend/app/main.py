from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import compare

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Video Comparator API",
    description="Backend for comparing video metadata using AI",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-video-comparator.vercel.app",
        "https://video-comparison-frontend.vercel.app",
        "https://video-comparison-frontend-*.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compare.router)

@app.get("/")
async def root():
    return {"message": "AI Video Comparator API is running"}