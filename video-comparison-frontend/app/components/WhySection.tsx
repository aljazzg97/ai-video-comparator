"use client";

import { Shield, Zap, Eye, Award, Clock, Lock } from "lucide-react";

export default function WhySection() {
  const benefits = [
    {
      icon: Shield,
      title: "Zero Uploads, 100% Private",
      description:
        "All metadata extraction happens locally via WebAssembly. Your video files never leave your browser—only anonymized technical data reaches our AI.",
    },
    {
      icon: Zap,
      title: "MediaInfo‑Grade Precision",
      description:
        "We extract every parameter the desktop MediaInfo tool sees: codec profiles, HDR metadata (Dolby Vision, HDR10+), color primaries, transfer functions, and mastering display luminance.",
    },
    {
      icon: Eye,
      title: "AI That Thinks Like an Engineer",
      description:
        "Our AI doesn't just compare file sizes—it weighs codec efficiency, bit depth advantages, chroma subsampling, and audio fidelity to deliver a professional verdict in seconds.",
    },
    {
      icon: Award,
      title: "Trusted by Professionals",
      description:
        "Used by video editors, colorists, and archivists to validate encodes, compare mastering settings, and ensure archival masters meet the highest standards.",
    },
    {
      icon: Clock,
      title: "From Hours to Seconds",
      description:
        "Manually comparing MediaInfo reports is tedious and error‑prone. Our side‑by‑side comparison table and AI summary give you actionable insights instantly.",
    },
    {
      icon: Lock,
      title: "No Account, No Tracking",
      description:
        "Free forever. No sign‑up, no analytics, no cookies. Just a professional tool built for the community.",
    },
  ];

  return (
    <section className="border-t border-gray-800 py-16 px-4 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why video professionals are switching to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI‑powered comparison
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Stop squinting at raw MediaInfo dumps. Get instant, expert‑level analysis
            that tells you exactly which file delivers superior quality—and why.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/40 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-sm text-gray-400">Video Uploads Required</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-white">100+</div>
            <div className="text-sm text-gray-400">Metadata Fields Extracted</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-white">&lt;2s</div>
            <div className="text-sm text-gray-400">Local Extraction Time</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">Free Forever</div>
          </div>
        </div>
      </div>
    </section>
  );
}