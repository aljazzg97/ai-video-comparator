"use client";

import { useState, useCallback } from "react";
import VideoDropzone from "./components/VideoDropzone";
import ResultsCard from "./components/ResultsCard";
import UltimateMetadataViewer from "./components/UltimateMetadataViewer";
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { extractMetadata, extractUltimateMetadata, VideoMetadata } from "@/lib/extractMetadata";
import { UltimateVideoMetadata } from "@/lib/mediaTypes";

interface AnalysisResult {
  winner: string;
  summary: string;
  pros_a: string[];
  cons_a: string[];
  pros_b: string[];
  cons_b: string[];
  technical_verdict: string;
}

export default function Home() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [metadataA, setMetadataA] = useState<VideoMetadata | null>(null);
  const [metadataB, setMetadataB] = useState<VideoMetadata | null>(null);
  const [ultimateA, setUltimateA] = useState<UltimateVideoMetadata | null>(null);
  const [ultimateB, setUltimateB] = useState<UltimateVideoMetadata | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUltimateA, setShowUltimateA] = useState(false);
  const [showUltimateB, setShowUltimateB] = useState(false);

  const bothFilesReady = metadataA !== null && metadataB !== null;

  const handleFileASelect = useCallback(async (file: File) => {
    setFileA(file);
    setMetadataA(null);
    setUltimateA(null);
    setError(null);
    setResult(null);
    setLoadingA(true);
    try {
      const [meta, ultimate] = await Promise.all([
        extractMetadata(file),
        extractUltimateMetadata(file)
      ]);
      setMetadataA(meta);
      setUltimateA(ultimate);
    } catch (err) {
      setError(`Failed to extract metadata from Video A: ${err}`);
      setFileA(null);
    } finally {
      setLoadingA(false);
    }
  }, []);

  const handleFileBSelect = useCallback(async (file: File) => {
    setFileB(file);
    setMetadataB(null);
    setUltimateB(null);
    setError(null);
    setResult(null);
    setLoadingB(true);
    try {
      const [meta, ultimate] = await Promise.all([
        extractMetadata(file),
        extractUltimateMetadata(file)
      ]);
      setMetadataB(meta);
      setUltimateB(ultimate);
    } catch (err) {
      setError(`Failed to extract metadata from Video B: ${err}`);
      setFileB(null);
    } finally {
      setLoadingB(false);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!metadataA || !metadataB) return;
    setError(null);
    setIsAnalyzing(true);
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_a: metadataA, video_b: metadataB }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }
      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to AI backend");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFileA(null);
    setFileB(null);
    setMetadataA(null);
    setMetadataB(null);
    setUltimateA(null);
    setUltimateB(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setShowUltimateA(false);
    setShowUltimateB(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI Video Codec
              </span>{" "}
              Comparator Ultimate
            </h1>
            <p className="mt-2 text-gray-400">
              Full MediaInfo extraction + AI analysis. Metadata stays local.
            </p>
          </div>
          {(fileA || fileB || result) && (
            <button onClick={handleReset} className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              Reset All
            </button>
          )}
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/30 border border-red-700 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 space-y-2">
            <VideoDropzone
              label="Video A"
              selectedFile={fileA}
              onFileSelect={handleFileASelect}
              metadata={metadataA}
              isLoading={loadingA}
            />
            {ultimateA && (
              <div>
                <button
                  onClick={() => setShowUltimateA(!showUltimateA)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 mt-1"
                >
                  {showUltimateA ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Full MediaInfo Details
                </button>
                {showUltimateA && <UltimateMetadataViewer metadata={ultimateA} label="Video A - All Tracks" />}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <VideoDropzone
              label="Video B"
              selectedFile={fileB}
              onFileSelect={handleFileBSelect}
              metadata={metadataB}
              isLoading={loadingB}
            />
            {ultimateB && (
              <div>
                <button
                  onClick={() => setShowUltimateB(!showUltimateB)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 mt-1"
                >
                  {showUltimateB ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Full MediaInfo Details
                </button>
                {showUltimateB && <UltimateMetadataViewer metadata={ultimateB} label="Video B - All Tracks" />}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!bothFilesReady || isAnalyzing}
            className={`group relative flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold transition-all ${
              bothFilesReady && !isAnalyzing
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-xl"
                : "cursor-not-allowed bg-gray-700 text-gray-400"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI is analyzing codecs...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze with AI
              </>
            )}
          </button>
          {!bothFilesReady && !isAnalyzing && (
            <p className="mt-3 text-sm text-gray-500">
              {!fileA && !fileB ? "Select two videos to begin" : "Waiting for metadata extraction to complete..."}
            </p>
          )}
        </div>

        {result && (
          <ResultsCard
            result={result}
            videoAName={fileA?.name || "Video A"}
            videoBName={fileB?.name || "Video B"}
          />
        )}

        {!result && !isAnalyzing && bothFilesReady && (
          <div className="mt-12 rounded-lg border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Analysis Results</h2>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-700 bg-gray-800/30">
              <p className="text-gray-400 text-center">Ready to analyze! Click the button above.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}