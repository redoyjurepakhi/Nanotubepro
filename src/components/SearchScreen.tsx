import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, Mic, RefreshCw, History, ShieldAlert, Plus } from "lucide-react";
import { Video, VideoCard, SafeImage } from "./Common";
import { safeFetch } from "../lib/fetchUtils";

interface SearchScreenProps {
  apiKeys: string;
  region: string;
  onClose: () => void;
  onSelectVideo: (v: Video) => void;
  onChannelClick: (cid: string) => void;
  playlists: Record<string, Video[]>;
  onWatchLater: (v: Video) => void;
  onAddToPlaylist: (v: Video, name?: string) => void;
  onQueue: (v: Video) => void;
  onShare: (v: Video) => void;
}

export default function SearchScreen({ 
  apiKeys, 
  region, 
  onClose, 
  onSelectVideo, 
  onChannelClick, 
  playlists, 
  onWatchLater, 
  onAddToPlaylist, 
  onQueue, 
  onShare 
}: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [instantResults, setInstantResults] = useState<Video[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("nanotube_search_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isResultMode, setIsResultMode] = useState(false);

  // Real YouTube API Search for Live Instant Results (Suggestions) - DISABLED to save quota
  useEffect(() => {
    setInstantResults([]);
  }, [query]);

  const performSearch = async (searchTerm: string, isAppend = false) => {
    if (!searchTerm.trim()) return;
    
    setQuery(searchTerm);
    setIsResultMode(true);
    if (!isAppend) {
      setLoading(true);
      setResults([]);
      setNextPageToken(null);
    } else {
      setLoadingMore(true);
    }

    const keys = apiKeys.split(",").map(k => k.trim()).filter(k => k);
    const apiKey = keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;

    if (!apiKey) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(searchTerm)}&type=video,channel&key=${apiKey}&regionCode=${region}${isAppend && nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const res = await safeFetch(url);
      if (res.ok) {
        const data = await res.json();
        setNextPageToken(data.nextPageToken || null);

        const transformed = data.items.map((item: any): Video => {
          const type = item.id?.kind === "youtube#channel" ? "channel" : "video";
          const id = item.id?.videoId || item.id?.channelId || item.id;
          const snippet = item.snippet;
          return {
            id,
            type,
            title: snippet.title,
            channel: type === "channel" ? snippet.title : snippet.channelTitle,
            channelId: snippet.channelId || id,
            views: type === "channel" ? "Channel" : "Live",
            time: snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : "Recently",
            thumbnail: type === "channel" ? snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url : `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            duration: type === "channel" ? "" : "10:00"
          };
        });

        if (isAppend) {
          setResults(prev => [...prev, ...transformed]);
        } else {
          setResults(transformed);
          // Save history
          const newHistory = [searchTerm, ...searchHistory.filter(s => s !== searchTerm)].slice(0, 15);
          setSearchHistory(newHistory);
          localStorage.setItem("nanotube_search_history", JSON.stringify(newHistory));
        }
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite Scroll Observer
  useEffect(() => {
    if (!isResultMode || !nextPageToken || loading || loadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        performSearch(query, true);
      }
    }, { threshold: 0.1 });

    const el = document.getElementById("search-scroll-trigger");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [isResultMode, nextPageToken, loading, loadingMore, query]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-bg-dark z-[200] flex flex-col overflow-hidden pt-[env(safe-area-inset-top)]"
    >
      {/* SEARCH HEADER */}
      <div className="flex items-center gap-2 p-3 bg-[#0A0A0A] border-b border-white/5">
        <button 
          onClick={() => {
            if (isResultMode && results.length > 0) {
              setIsResultMode(false);
            } else {
              onClose();
            }
          }}
          className="p-3 text-white/70 active:bg-white/10 rounded-2xl transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex items-center bg-white/5 border border-white/5 rounded-2xl px-4 overflow-hidden focus-within:border-brand-red/50 transition-all">
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsResultMode(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
            placeholder="Search NanoTube..."
            className="flex-1 py-3 text-[16px] text-white placeholder-white/20 bg-transparent focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => {
                setQuery("");
                setIsResultMode(false);
                setResults([]);
              }} 
              className="p-1 text-white/40 hover:text-white"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          )}
        </div>

        <button className="p-3 bg-white/5 rounded-2xl text-white/40 active:bg-white/10 border border-white/5">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!isResultMode ? (
          <div className="p-2 space-y-1">
            {/* SEARCH HISTORY (Visible when query is empty) */}
            {!query && searchHistory.map((s, idx) => (
              <button
                key={`hist-${s}-${idx}`}
                onClick={() => performSearch(s)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left transition-colors group"
              >
                <div className="p-2 bg-white/5 rounded-xl text-white/20 group-hover:text-brand-red transition-colors">
                  <History className="w-4 h-4" />
                </div>
                <span className="flex-1 text-[15px] text-white/60 font-medium truncate group-hover:text-white transition-colors">{s}</span>
                <div 
                  className="p-2 opacity-20 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery(s);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 rotate-[135deg]" />
                </div>
              </button>
            ))}

            {/* INSTANT RESULTS DISABLED */}

            {!query && searchHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 italic">
                <Search className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Search nano content</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {Array(12).fill(0).map((_, i) => (
                   <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                 ))}
              </div>
            ) : results.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.map((v, idx) => (
                      <VideoCard 
                        key={`${v.id}-${idx}`} 
                        video={v} 
                        onClick={() => onSelectVideo(v)}
                        onWatchLater={onWatchLater}
                        onAddToPlaylist={onAddToPlaylist}
                        onQueue={onQueue}
                        onShare={onShare}
                        playlists={playlists}
                        onChannelClick={onChannelClick}
                      />
                    ))}
                 </div>
                 
                 <div id="search-scroll-trigger" className="h-20 flex items-center justify-center">
                    {loadingMore && <RefreshCw className="w-6 h-6 text-brand-red animate-spin" />}
                 </div>
               </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                 <ShieldAlert className="w-12 h-12 text-white/10" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No results found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
