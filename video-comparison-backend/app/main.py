from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import compare

# Initialize FastAPI app
app = FastAPI(
    title="AI Video Comparator API",
    description="Backend for comparing video metadata using OpenAI",
    version="0.1.0",
)

# Configure CORS to allow requests from the frontend (Next.js dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.21:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the compare router
app.include_router(compare.router)

# Root endpoint for health check
@app.get("/")
async def root():
    return {"message": "AI Video Comparator API is running"}