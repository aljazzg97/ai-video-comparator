"use client";

import { useState, useCallback } from "react";
import VideoDropzone from "./components/VideoDropzone";
import ResultsCard from "./components/ResultsCard";
import ComparisonTable from "./components/ComparisonTable";
import UltimateMetadataViewer from "./components/UltimateMetadataViewer";
import FAQ from "./components/FAQ";
import Logo from "./components/Logo";
import { Sparkles, Loader2, AlertCircle, ChevronDown, ChevronRight, Shield, Zap, Eye } from "lucide-react";
import { extractMetadata, VideoMetadata } from "@/lib/extractMetadata";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";



const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

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
    setError(null);
    setResult(null);
    setLoadingA(true);
    try {
      const meta = await extractMetadata(file);
      setMetadataA(meta);
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
    setError(null);
    setResult(null);
    setLoadingB(true);
    try {
      const meta = await extractMetadata(file);
      setMetadataB(meta);
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
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compare`, {

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
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setShowUltimateA(false);
    setShowUltimateB(false);
  };

  const scrollToTool = () => {
    document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="relative z-20 px-4 py-4 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo className="h-8 w-auto" />
          <a
            href="https://github.com/aljazzg97/ai-video-comparator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-black" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">Professional Video Forensics</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Compare{" "}
            <TypeAnimation
              sequence={[
                "Codecs",
                2000,
                "HDR Metadata",
                2000,
                "Color Science",
                2000,
                "Audio Fidelity",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
            />
            <span className="block mt-2">Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Full MediaInfo extraction + AI analysis. Codecs, HDR, color science, 
            and audio — compared side‑by‑side, 100% private.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={scrollToTool}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              <Eye className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Analyze My Videos Now
              <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Free forever • No account needed</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Local WASM processing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Dolby Vision • HDR10+ • HLG
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Lossless audio detection
            </span>
          </div>
        </div>
      </section>

      {/* Trust Bar (animated) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-y border-gray-800 py-8 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm uppercase tracking-wider text-gray-500 mb-6">
            Trusted by video engineers and archivists
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-gray-400 font-mono text-sm opacity-60 hover:opacity-100 transition-opacity">
              MEDIAINFO ENGINE
            </div>
            <div className="text-gray-400 font-mono text-sm opacity-60 hover:opacity-100 transition-opacity">
              DOLBY VISION
            </div>
            <div className="text-gray-400 font-mono text-sm opacity-60 hover:opacity-100 transition-opacity">
              HDR10+
            </div>
            <div className="text-gray-400 font-mono text-sm opacity-60 hover:opacity-100 transition-opacity">
              LOSSLESS AUDIO
            </div>
            <div className="text-gray-400 font-mono text-sm opacity-60 hover:opacity-100 transition-opacity">
              BT.2020
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-300 italic max-w-2xl mx-auto text-sm">
              "Finally, a web tool that doesn't require uploading terabytes of footage. 
              The AI analysis is surprisingly accurate — it caught a 8‑bit SDR file 
              that was incorrectly tagged as HDR."
            </p>
            <p className="text-gray-500 text-xs mt-3">— Professional Colorist, LA</p>
          </div>
        </div>
      </motion.section>

      {/* How It Works (animated) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-t border-gray-800 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-300">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drop Your Files</h3>
              <p className="text-gray-400">Select two video files (MP4, MKV, MOV, etc.) using our drag‑and‑drop zones.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/50 border border-purple-700 flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Local Metadata Scan</h3>
              <p className="text-gray-400">WebAssembly extracts every MediaInfo detail — codec, HDR, color primaries, audio — right in your browser.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/50 border border-green-700 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Verdict</h3>
              <p className="text-gray-400">Our AI compares all parameters and delivers a professional verdict with pros, cons, and technical reasoning.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tool Section */}
      <section id="tool-section" className="px-4 py-16 scroll-mt-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 rounded-lg bg-red-900/30 border border-red-700 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 font-medium">Error</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Step 1: Drop Your Files</h2>
            {(fileA || fileB || result) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 space-y-2">
              <VideoDropzone
                label="Video A"
                selectedFile={fileA}
                onFileSelect={handleFileASelect}
                metadata={metadataA}
                isLoading={loadingA}
              />
              {metadataA && (
                <>
                  <button
                    onClick={() => setShowUltimateA(!showUltimateA)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 mt-1"
                  >
                    {showUltimateA ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Full MediaInfo Details
                  </button>
                  {showUltimateA && <UltimateMetadataViewer metadata={metadataA} label="Video A" />}
                </>
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
              {metadataB && (
                <>
                  <button
                    onClick={() => setShowUltimateB(!showUltimateB)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 mt-1"
                  >
                    {showUltimateB ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Full MediaInfo Details
                  </button>
                  {showUltimateB && <UltimateMetadataViewer metadata={metadataB} label="Video B" />}
                </>
              )}
            </div>
          </div>

          {/* Static Comparison Table */}
          {bothFilesReady && metadataA && metadataB && fileA && fileB && (
            <div className="mt-8">
              <ComparisonTable
                metadataA={metadataA}
                metadataB={metadataB}
                videoAName={fileA.name}
                videoBName={fileB.name}
              />
            </div>
          )}

          {/* Analyze Button */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!bothFilesReady || isAnalyzing}
              className={`group relative flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold transition-all ${
                bothFilesReady && !isAnalyzing
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
                  : "cursor-not-allowed bg-gray-700 text-gray-400"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI is analyzing codecs...
                  <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                  Analyze with AI
                  <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
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
                <p className="text-gray-400 text-center">
                  Ready to analyze! Click the button above to get AI insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Use Cases (animated) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-t border-gray-800 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Built for professionals who need certainty
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Whether you're archiving, encoding, or just curating — know exactly what's in your files.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quality Control</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Verify that your encodes meet spec: bit depth, chroma subsampling, and HDR metadata are all correct.
              </p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-purple-900/50 flex items-center justify-center mb-4">
                <Eye className="h-5 w-5 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Encoding Decisions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Compare CRF vs. CBR, HEVC vs. AV1, or different mastering profiles to see which delivers the best efficiency.
              </p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-green-900/50 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Archival Validation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ensure your masters retain lossless audio, proper color primaries, and maximum dynamic range.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Privacy Badge (animated) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-t border-gray-800 py-12 px-4"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-full px-5 py-2 mb-4">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-green-300 font-medium">100% Private & Secure</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Your videos never leave your browser</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            All metadata extraction happens locally using WebAssembly. Only the anonymized technical data is sent to the AI for analysis. We don't store anything — ever.
          </p>
        </div>
      </motion.section>

      {/* FAQ (animated) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <FAQ />
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-3">AI Video Comparator</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Professional video analysis without the upload. 
                MediaInfo‑grade metadata, AI‑powered insights.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#tool-section" className="hover:text-gray-200 transition-colors">Comparator</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">API (coming soon)</a></li>
                <li><a href="https://github.com/aljazzg97/ai-video-comparator" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2025 AI Video Comparator. All rights reserved.</p>
            <p className="text-gray-500 text-xs">
              Made for video professionals. No uploads, ever.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}