"use client";

import { CheckCircle, XCircle, Trophy, Sparkles } from "lucide-react";

interface AnalysisResult {
  winner: string;
  summary: string;
  pros_a: string[];
  cons_a: string[];
  pros_b: string[];
  cons_b: string[];
  technical_verdict: string;
}

interface ResultsCardProps {
  result: AnalysisResult;
  videoAName: string;
  videoBName: string;
}

export default function ResultsCard({ result, videoAName, videoBName }: ResultsCardProps) {
  const isVideoAWinner = result.winner.toLowerCase().includes("video a");
  const isVideoBWinner = result.winner.toLowerCase().includes("video b");
  const isTie = result.winner.toLowerCase().includes("tie");

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Winner Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border border-blue-800/50">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isTie ? "It's a Tie!" : `Winner: ${result.winner}`}
            </h2>
            <p className="text-gray-300 mt-1">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Side-by-side Pros/Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video A Column */}
        <div className={`rounded-lg border p-5 ${
          isVideoAWinner ? "border-green-500 bg-green-900/20" : "border-gray-700 bg-gray-800/40"
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            isVideoAWinner ? "text-green-400" : "text-white"
          }`}>
            {videoAName}
            {isVideoAWinner && " 🏆"}
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-green-400 flex items-center gap-1 mb-2">
                <CheckCircle className="h-4 w-4" /> Pros
              </p>
              <ul className="space-y-1">
                {result.pros_a.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-sm font-medium text-red-400 flex items-center gap-1 mb-2">
                <XCircle className="h-4 w-4" /> Cons
              </p>
              <ul className="space-y-1">
                {result.cons_a.map((con, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Video B Column */}
        <div className={`rounded-lg border p-5 ${
          isVideoBWinner ? "border-green-500 bg-green-900/20" : "border-gray-700 bg-gray-800/40"
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            isVideoBWinner ? "text-green-400" : "text-white"
          }`}>
            {videoBName}
            {isVideoBWinner && " 🏆"}
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-green-400 flex items-center gap-1 mb-2">
                <CheckCircle className="h-4 w-4" /> Pros
              </p>
              <ul className="space-y-1">
                {result.pros_b.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-sm font-medium text-red-400 flex items-center gap-1 mb-2">
                <XCircle className="h-4 w-4" /> Cons
              </p>
              <ul className="space-y-1">
                {result.cons_b.map((con, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Verdict */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-5">
        <h3 className="text-md font-semibold text-white flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Technical Verdict
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">{result.technical_verdict}</p>
      </div>
    </div>
  );
}