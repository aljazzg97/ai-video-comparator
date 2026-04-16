"use client";

import { useState } from 'react';
import { UltimateVideoMetadata } from '@/lib/mediaTypes';
import { ChevronDown, ChevronRight, FileJson } from 'lucide-react';

interface UltimateMetadataViewerProps {
  metadata: UltimateVideoMetadata;
  label: string;
}

export default function UltimateMetadataViewer({ metadata, label }: UltimateMetadataViewerProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'video' | 'audio' | 'text' | 'raw'>('video');
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});

  const tabs = [
    { id: 'general', label: 'General', count: metadata.general ? 1 : 0 },
    { id: 'video', label: 'Video', count: metadata.video.length },
    { id: 'audio', label: 'Audio', count: metadata.audio.length },
    { id: 'text', label: 'Text', count: metadata.text.length },
    { id: 'raw', label: 'Raw JSON', count: 0 },
  ] as const;

  const toggleTrack = (trackId: string) => {
    setExpandedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const renderTrackTable = (track: any, type: string, index?: number) => {
    const trackId = `${type}-${index ?? 0}`;
    const isExpanded = expandedTracks[trackId] ?? (type === 'general' || type === 'raw');
    
    const entries = Object.entries(track).filter(([key]) => 
      key !== '@type' && key !== 'extra' && typeof track[key] !== 'object'
    );

    if (entries.length === 0) return null;

    return (
      <div key={trackId} className="mb-3 border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30">
        <button
          onClick={() => toggleTrack(trackId)}
          className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-700/30 transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-200">
            {type === 'general' ? 'General' : `${type} Track ${index !== undefined ? `#${index + 1}` : ''}`}
            {track.Format && <span className="ml-2 text-xs text-blue-400 font-normal">({track.Format})</span>}
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-gray-700/50">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {entries.map(([key, value]) => (
                <div key={key} className="contents">
                  <span className="text-gray-400 py-0.5">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-200 font-mono py-0.5 break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return metadata.general ? renderTrackTable(metadata.general, 'general') : <p className="text-gray-400 p-4">No general information found.</p>;
      case 'video':
        return metadata.video.length > 0 
          ? metadata.video.map((track, i) => renderTrackTable(track, 'Video', i))
          : <p className="text-gray-400 p-4">No video tracks found.</p>;
      case 'audio':
        return metadata.audio.length > 0 
          ? metadata.audio.map((track, i) => renderTrackTable(track, 'Audio', i))
          : <p className="text-gray-400 p-4">No audio tracks found.</p>;
      case 'text':
        return metadata.text.length > 0 
          ? metadata.text.map((track, i) => renderTrackTable(track, 'Text', i))
          : <p className="text-gray-400 p-4">No text/subtitle tracks found.</p>;
      case 'raw':
        return (
          <div className="p-3">
            <pre className="text-xs text-gray-300 overflow-auto max-h-96 bg-gray-900/50 p-3 rounded border border-gray-700">
              {JSON.stringify(metadata.raw || metadata, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="mt-4 border border-gray-700 rounded-lg bg-gray-800/30 overflow-hidden">
      <div className="border-b border-gray-700 px-3 py-2 bg-gray-800/50">
        <h3 className="text-md font-medium text-gray-200">{label}</h3>
      </div>
      <div className="flex border-b border-gray-700 bg-gray-800/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/40' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>
      <div className="p-3 max-h-96 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}