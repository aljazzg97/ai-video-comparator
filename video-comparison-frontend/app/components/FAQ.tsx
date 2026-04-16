"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Is my video uploaded to any server?",
    answer: "No. All metadata extraction happens locally in your browser using WebAssembly. Your video files never leave your device. Only the extracted text metadata is sent to the AI for analysis—never the video itself.",
  },
  {
    question: "What file types are supported?",
    answer: "MP4, MKV, MOV, AVI, WebM, and most common video containers. The underlying MediaInfo engine supports hundreds of formats and codecs.",
  },
  {
    question: "What does the AI evaluate?",
    answer: "The AI analyzes codec efficiency (HEVC, AV1, AVC), bit depth (10-bit vs 8-bit), chroma subsampling (4:4:4, 4:2:2, 4:2:0), HDR formats (Dolby Vision, HDR10+, HDR10, HLG), color primaries (BT.2020, DCI-P3, BT.709), transfer characteristics (PQ, HLG), mastering display metadata, audio codec quality, and overall compression efficiency.",
  },
  {
    question: "Why did Video A win?",
    answer: "The AI provides a detailed technical verdict explaining exactly which features gave the edge—whether it's superior HDR, better compression, higher bit depth, or lossless audio.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No account required. The tool is completely free to use with no sign‑up.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mt-16 border-t border-gray-800 pt-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg bg-gray-800/30 overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <span className="font-medium text-white">{item.question}</span>
                {openIndex === index ? (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed border-t border-gray-700/50 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}