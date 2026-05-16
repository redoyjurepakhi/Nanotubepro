import { App } from "@capacitor/app";
import { GoogleGenAI } from "@google/genai";
import { ScreenOrientation } from '@capacitor/screen-orientation';
import React, { useState, useEffect } from "react";
import InterstitialAd from "./components/InterstitialAd";
import { motion, AnimatePresence } from "motion/react";
import ShortsScreen from "./components/ShortsScreen";
import { registerPlugin } from "@capacitor/core";
import { 
  Settings, 
  Play, 
  Search, 
  Mic,
  RefreshCw,
  Trash2,
  History,
  AlertTriangle,
  ArrowLeft,
  Share2,
  ThumbsUp,
  MessageSquare,
  User,
  Plus,
  MoreVertical,
  ListPlus,
  Clock,
  Forward,
  Rewind,
  Maximize,
  Minimize,
  ChevronRight,
  Copy,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// YouTube Video Type
interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  time: string;
  thumbnail: string;
  duration: string;
  description?: string;
  likes?: string;
  channelThumbnail?: string;
  channelId?: string;
  type?: 'video' | 'channel';
  subscriberCount?: string;
}

interface HistoryItem {
  video: Video;
  progress: number; // seconds
  duration: number; // total seconds (if known)
  watchedAt: number;
}

export default function App() {
  const Immersive = registerPlugin("Immersive");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "search" | "shorts" | "profile">("home");
  const [profileView, setProfileView] = useState<"main" | "settings" | "history" | "watch-later" | "queue" | "playlists" | "setup" | "changelogs" | "about" | "channel">("main");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<Partial<Video> | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [loadingChannel, setLoadingChannel] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiKeys, setApiKeys] = useState<string>(() => localStorage.getItem("nanotube_api_keys") || "");
  const [region, setRegion] = useState<string>(() => localStorage.getItem("nanotube_region") || "US");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("nanotube_search_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dataSaver, setDataSaver] = useState(() => localStorage.getItem("nanotube_data_saver") === "true");
  const [qualityPreference, setQualityPreference] = useState(() => localStorage.getItem("nanotube_quality") || "auto");
  const [aggressiveCaching, setAggressiveCaching] = useState(() => localStorage.getItem("nanotube_aggressive_caching") === "true");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("nanotube_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [watchLater, setWatchLater] = useState<Video[]>(() => {
    const saved = localStorage.getItem("nanotube_watch_later");
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState<Record<string, Video[]>>(() => {
    const saved = localStorage.getItem("nanotube_playlists");
    return saved ? JSON.parse(saved) : { "My Favorites": [] };
  });
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const mainRef = React.useRef<HTMLElement>(null);

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    setPlaylists(prev => {
      if (prev[name]) return prev;
      return { ...prev, [name]: [] };
    });
    setNewPlaylistName("");
  };

  // Sync state and navigation
  useEffect(() => {

  const handlePopState = (e: PopStateEvent) => {

    if (e.state) {

      if (e.state.tab) setActiveTab(e.state.tab);

      if (e.state.view) setProfileView(e.state.view);

      if (e.state.video === null) setSelectedVideo(null);

    } else {

      // CLOSE VIDEO FIRST
      if (selectedVideo) {

        setSelectedVideo(null);

        return;

      }

      // PROFILE SUBPAGE -> PROFILE MAIN
      if (
        activeTab === "profile" &&
        profileView !== "main"
      ) {

        setProfileView("main");

        window.history.pushState(
          {
            tab: "profile",
            view: "main",
            video: null
          },
          ""
        );

        return;

      }
      
      //Shortspage
      {activeTab === "shorts" && (
  <ShortsScreen videos={videos} />
)}

      // SEARCH OR PROFILE -> HOME
      if (
        activeTab === "search" ||
        activeTab === "profile"
      ) {

        setActiveTab("home");

        setProfileView("main");

        window.history.pushState(
          {
            tab: "home",
            view: "main",
            video: null
          },
          ""
        );

        return;

      }

      // HOME -> EXIT APP
      App.exitApp();

    }

  };

  window.addEventListener("popstate", handlePopState);

  // Initial state
  window.history.replaceState(
    {
      tab: activeTab,
      view: profileView,
      video: selectedVideo
    },
    ""
  );

  return () =>
    window.removeEventListener("popstate", handlePopState);

}, [activeTab, profileView, selectedVideo]);

  const changeTab = (tab: "home" | "search" | "profile") => {
    setActiveTab(tab);
    setProfileView("main");
    window.history.pushState({ tab, view: "main", video: null }, "");
  };

  const changeProfileView = (view: typeof profileView) => {
    setProfileView(view);
    window.history.pushState({ tab: "profile", view, video: null }, "");
  };

  const selectVideo = (v: Video | null) => {

  if (v) {

    const adCount =
      Number(localStorage.getItem("nanotube_ad_count") || "0") + 1;

    localStorage.setItem(
      "nanotube_ad_count",
      String(adCount)
    );

    // Show interstitial every 4th video
    if (adCount % 4 === 0) {

      setPendingVideo(v);

      setShowAdModal(true);

      return;
    }

    setSelectedVideo(v);

    window.history.pushState(
      {
        tab: activeTab,
        view: profileView,
        video: v.id,
      },
      ""
    );

  } else {

    setSelectedVideo(null);

    if (window.history.state?.video) {
      window.history.back();
    }

  }
};

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("nanotube_history", JSON.stringify(history));
    localStorage.setItem("nanotube_watch_later", JSON.stringify(watchLater));
    localStorage.setItem("nanotube_playlists", JSON.stringify(playlists));
    localStorage.setItem("nanotube_search_history", JSON.stringify(searchHistory));
    localStorage.setItem("nanotube_data_saver", String(dataSaver));
    localStorage.setItem("nanotube_quality", qualityPreference);
    localStorage.setItem("nanotube_aggressive_caching", String(aggressiveCaching));
  }, [history, watchLater, playlists, searchHistory, dataSaver, qualityPreference, aggressiveCaching]);

  // Persistence logic
  const saveSettings = () => {
    localStorage.setItem("nanotube_api_keys", apiKeys);
    localStorage.setItem("nanotube_region", region);
    localStorage.setItem("nanotube_quality", qualityPreference);
    alert("Settings saved successfully!");
  };

  // Clear search and return home
  const goHome = async () => {

  setSearchQuery("");

  setSuggestions([]);

  setShowSuggestions(false);

  setIsSearchOpen(false);

  changeTab("home");

  // Reset current videos first
  setVideos([]);

  // Reload trending/home feed
  await fetchVideos("");

};

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        try {
          const orientation = screen.orientation as any;
          if (orientation && orientation.lock) {
            orientation.lock("landscape").catch(() => {});
          }
        } catch (e) {
          console.warn("Orientation lock failed", e);
        }
      } else {
        try {
          const orientation = screen.orientation as any;
          if (orientation && orientation.unlock) {
            orientation.unlock();
          }
        } catch (e) {}
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  //fullscreen keyboard 
  useEffect(() => {

  const initialHeight = window.innerHeight;

  const handleResize = () => {

    const currentHeight = window.innerHeight;

    // Keyboard usually shrinks height heavily
    if (currentHeight < initialHeight - 150) {

      setKeyboardOpen(true);

    } else {

      setKeyboardOpen(false);

    }

  };

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener("resize", handleResize);

}, []);
  

  // Fetch Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Using a public endpoint for search suggestions
        const res = await fetch(`https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(searchQuery)}`);
        // Note: This returns a non-standard JSONP-like string [ "query", ["s1", "s2", ...], ... ]
        // We might need to handle CORS. If CORS fails, we fallback to a simple local logic or Gemini.
        if (res.ok) {
          const text = await res.text();
          const match = text.match(/\["([^"]+)",\[([^\]]+)\]/);
          if (match && match[2]) {
             const items = match[2].split(",").map(s => s.replace(/"/g, "").trim()).slice(0, 5);
             setSuggestions(items);
          }
        }
    } catch (e) {
  console.warn("Suggestions fetch failed - using local suggestions");

  const localSuggestions = videos
    .map(v => v.title)
    .filter(title =>
      title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  setSuggestions(localSuggestions);
 }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Videos using multiple strategies
  const fetchVideos = async (query?: string, isAppend = false) => {
    if (isAppend) setLoadingMore(true);
    else setLoading(true);

    const getApiKey = () => {
      const keys = apiKeys.split(",").map(k => k.trim()).filter(k => k);
      return keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;
    };

    const apiKey = getApiKey();

    const transformYoutube = (item: any): Video => {
      const type = item.id?.kind === "youtube#channel" ? "channel" : "video";
      const id = item.id?.videoId || item.id?.channelId || item.id;
      const snippet = item.snippet;
      return {
        id,
        type,
        title: snippet.title,
        channel: type === "channel" ? snippet.title : snippet.channelTitle,
        channelId: snippet.channelId || id,
        views: item.statistics ? `${(parseInt(item.statistics.viewCount) / 1000000).toFixed(1)}M views` : (type === "channel" ? "Channel" : "Live"),
        time: snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : "Recently",
        thumbnail: type === "channel" ? snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url : `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        duration: item.contentDetails?.duration?.replace('PT', '').toLowerCase() || (type === "channel" ? "" : "10:00")
      };
    };

    const transformPiped = (item: any): Video => ({
      id: item.url.split("v=")[1],
      title: item.title,
      channel: item.uploaderName,
      views: item.views ? `${(item.views / 1000000).toFixed(1)}M` : "Live",
      time: item.uploadedDate || "Recently",
      thumbnail: item.thumbnail,
      duration: item.duration ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, '0') : "00:00"
    });

    try {
      let results: Video[] = [];

      // 1. Try YouTube API if key is present
      if (apiKey) {
        console.log("Using YouTube API...");
        const url = query 
          ? `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video,channel&key=${apiKey}&regionCode=${region}`
          : `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=12&regionCode=${region}&key=${apiKey}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          results = data.items.map(transformYoutube);
        }
      }

      // 2. Try Piped API as alternative (No key needed)
      if (results.length === 0) {
        console.log("Using Piped API (Alternative)...");
        const url = query
          ? `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`
          : `https://pipedapi.kavin.rocks/trending?region=${region}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.relatedStreams || []);
          results = items.map(transformPiped).filter((v: Video) => v.id);
        }
      }

      // 3. Last Resort: Gemini Simulation
      if (results.length === 0) {
        console.log("Using Gemini Fallback...");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const prompt = `Provide a JSON array of 12 distinct, PUBLIC, AND EMBEDDABLE YouTube video IDs ${query ? `related to "${query}"` : `that are trending in ${region} right now`}. 
        Each object MUST have: id (ACTUAL working video ID), title, channel, views, time, duration. Return ONLY the JSON array.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts: [{ text: prompt }] }],
        });
        
        const text = response.text;
        const cleanedText = text.replace(/```json|```/g, "").trim();
        results = JSON.parse(cleanedText).map((v: any) => ({
          ...v,
          thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`
        }));
      }

      if (isAppend) {
        setVideos(prev => [...prev, ...results]);
      } else {
        setVideos(results);
      }
    } catch (error) {
      console.error("All fetch strategies failed", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchChannelContent = async (channelId: string) => {
    const keys = apiKeys.split(",").map(k => k.trim()).filter(k => k);
    const apiKey = keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;
    if (!apiKey) return;

    setSelectedVideo(null);
    setLoadingChannel(true);
    setProfileView("channel");
    setSelectedChannelId(channelId);
    setActiveTab("profile");
    window.history.pushState({ tab: "profile", view: "channel", video: null }, "");

    try {
      // Fetch channel details
      const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`);
      if (chanRes.ok) {
        const chanData = await chanRes.json();
        const item = chanData.items?.[0];
        if (item) {
          setChannelData({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            subscriberCount: item.statistics?.subscriberCount ? (parseInt(item.statistics.subscriberCount) >= 1000000 ? (parseInt(item.statistics.subscriberCount)/1000000).toFixed(1) + "M" : (parseInt(item.statistics.subscriberCount)/1000).toFixed(1) + "K") : "0",
            description: item.snippet.description
          });
        }
      }

      // Fetch channel videos
      const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${apiKey}`);
      if (videosRes.ok) {
        const data = await videosRes.json();
        const transformed = data.items.map((item: any) => {
          const id = item.id.videoId;
          return {
            id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            views: "Recently",
            time: new Date(item.snippet.publishedAt).toLocaleDateString(),
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            duration: "10:00"
          };
        });
        setChannelVideos(transformed);
      }
    } catch (e) {
      console.error("Failed to fetch channel", e);
    } finally {
      setLoadingChannel(false);
    }
  };

  useEffect(() => {
    if (activeTab === "home") {
      fetchVideos();
    }
  }, [activeTab, apiKeys]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && videos.length > 0 && activeTab === "home") {
          fetchVideos(searchQuery, true);
        }
      },
      { threshold: 1.0 }
    );

    const loaderElement = document.getElementById("scroll-trigger");
    if (loaderElement) observer.observe(loaderElement);

    return () => observer.disconnect();
  }, [loading, loadingMore, videos.length, activeTab, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos(searchQuery);
      setIsSearchOpen(false);
      // Save search term to suggestions mock history if needed, 
      // but the real ones come from the API.
    }
  };

  const addToHistory = (video: Video, progress: number = 0) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.video.id !== video.id);
      const newItem: HistoryItem = {
        video,
        progress,
        duration: parseDuration(video.duration),
        watchedAt: Date.now()
      };
      return [newItem, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  const parseDuration = (dur: string) => {
    const parts = dur.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const getWatchProgress = (id: string) => {
    const item = history.find(h => h.video.id === id);
    return item ? item.progress : 0;
  };

  const toggleWatchLater = (video: Video) => {
    setWatchLater(prev => {
      const exists = prev.find(v => v.id === video.id);
      if (exists) return prev.filter(v => v.id !== video.id);
      return [...prev, video];
    });
  };

  const addToPlaylist = (name: string, video: Video) => {
    setPlaylists(prev => {
      const list = prev[name] || [];
      if (list.find(v => v.id === video.id)) {
        alert(`Already in "${name}"`);
        return prev;
      }
      alert(`Saved to "${name}"`);
      return { ...prev, [name]: [...list, video] };
    });
  };

  const addToQueue = (video: Video) => {
    setQueue(prev => {
      if (prev.find(v => v.id === video.id)) return prev;
      return [...prev, video];
    });
  };

  const shareVideo = (video: Video) => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  

  

  if (selectedVideo) {
    return (
      <PlayerView 
        video={selectedVideo} 
        onClose={() => selectVideo(null)} 
        related={videos.filter(v => v.id !== selectedVideo.id)}
        initialTime={getWatchProgress(selectedVideo.id)}
        onProgress={(t, v) => addToHistory(v, t)}
        onWatchLater={toggleWatchLater}
        onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
        onQueue={addToQueue}
        onShare={shareVideo}
        onChannelClick={fetchChannelContent}
        playlists={playlists}
        qualityPreference={qualityPreference}
        onNavigateSettings={() => {
          setSelectedVideo(null); // Just hide view
          setActiveTab("profile");
          changeProfileView("settings");
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-bg-dark text-text-primary font-sans selection:bg-brand-red/30 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-[#0A0A0A] border-b border-border-dark shrink-0 z-[60] backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
          <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.3)] group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white text-white" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
            NanoTube<span className="text-brand-red text-[10px] ml-1 opacity-80 uppercase tracking-tighter">Lite</span>
          </h1>
        </div>

        <div className="flex-1 flex justify-center px-4 max-w-2xl relative">
          <div 
            onClick={() => changeTab("search")}
            className="w-full flex items-center bg-[#121212] border border-[#303030] rounded-full px-4 py-2 cursor-text group"
          >
            <span className="text-[14px] text-white/40 font-normal flex-1">Search</span>
            <Search className="w-5 h-5 text-white/70" />
          </div>
        </div>

        <div className="flex items-center gap-3">
           
           <button 
             onClick={() => {
               setActiveTab("profile");
               changeProfileView("settings");
             }}
             className="p-2 text-white/40 hover:text-brand-red transition-colors"
           >
             <Settings className="w-5 h-5" />
           </button>
           <div className={`w-2 h-2 rounded-full ${apiKeys.trim() ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"} animate-pulse`} />
        </div>
      </header>

      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-6 md:p-8 custom-scrollbar relative"
      >
        {/* PULL TO REFRESH INDICATOR */}
        <motion.div 
          className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: loading ? 1 : 0, y: loading ? 0 : -20 }}
        >
          <div className="bg-brand-red p-2 rounded-full shadow-lg">
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "home" ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {!apiKeys.trim() ? (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                  <div className="p-8 bg-red-400/10 rounded-full border border-red-500/20 shadow-2xl shadow-red-500/5">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black italic tracking-tighter">API REQUIRED</h2>
                    <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                      NanoTube requires a YouTube Data API v3 key to safely fetch content without exhausting regional quotas.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab("profile");
                      changeProfileView("settings");
                    }}
                    className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-xl shadow-brand-red/5 active:scale-95"
                  >
                    Configure Keys
                  </button>
                </div>
             ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {loading && videos.length === 0 ? (
                      Array(12).fill(0).map((_, i) => (
                        <div key={i} className="bg-card-dark rounded-xl aspect-video animate-pulse border border-white/5" />
                      ))
                    ) : (
                      videos.map((v, idx) => (
                        <VideoCard 
                          key={`${v.id}-${idx}`} 
                          video={v} 
                          onClick={() => selectVideo(v)}
                          onWatchLater={toggleWatchLater}
                          onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                          onQueue={addToQueue}
                          onShare={shareVideo}
                          onChannelClick={fetchChannelContent}
                          playlists={playlists}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* SCROLL TRIGGER FOR INFINITE SCROLL */}
                  <div id="scroll-trigger" className="h-20 flex items-center justify-center py-10">
                    {loadingMore && (
                      <RefreshCw className="w-6 h-6 text-brand-red animate-spin" />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === "search" ? (

  <motion.div
    key="search"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-6 pb-24"
  >

    <div className="sticky top-0 z-20 bg-bg-dark pb-4">
      <input
        type="text"
        placeholder="Search videos..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);

          if (e.target.value.trim()) {
            fetchVideos(e.target.value);
          }
        }}
        className="w-full p-4 rounded-2xl bg-card-dark border border-border-dark text-white outline-none"
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">

      {videos.map((v, idx) => (
        <VideoCard
          key={`${v.id}-${idx}`}
          video={v}
          onClick={() => selectVideo(v)}
          onWatchLater={toggleWatchLater}
          onAddToPlaylist={(v, pName) =>
            addToPlaylist(pName || "My Favorites", v)
          }
          onQueue={addToQueue}
          onShare={shareVideo}
          onChannelClick={fetchChannelContent}
          playlists={playlists}
        />
      ))}

    </div>

  </motion.div>

) : (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12 pb-24"
            >
              {profileView === "main" ? (
                <>
                  {/* PROFILE HEADER */}
                  <div className="flex items-center gap-6 p-8 bg-card-dark rounded-[2.5rem] border border-border-dark shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <User className="w-32 h-32" />
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-red to-orange-500 flex items-center justify-center shadow-2xl border-4 border-white/10 shrink-0">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black italic tracking-tighter">Elite Agent</h2>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">Status: Verified NanoTube User</p>
                    </div>
                    <button 
                      onClick={() => changeProfileView("settings")}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group relative z-10"
                    >
                      <Settings className="w-6 h-6 text-white/40 group-hover:text-brand-red transition-colors" />
                    </button>
                  </div>

                  {/* QUICK LINKS / CATEGORIES */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ProfileLink 
                      icon={<History className="w-4 h-4" />} 
                      label="History" 
                      count={history.length} 
                      onClick={() => changeProfileView("history")} 
                    />
                    <ProfileLink 
                      icon={<Clock className="w-4 h-4" />} 
                      label="Watch Later" 
                      count={watchLater.length} 
                      onClick={() => changeProfileView("watch-later")} 
                    />
                    <ProfileLink 
                      icon={<ListPlus className="w-4 h-4" />} 
                      label="Playlists" 
                      count={Object.keys(playlists).length} 
                      onClick={() => changeProfileView("playlists")} 
                    />
                    <ProfileLink 
                      icon={<Play className="w-4 h-4" />} 
                      label="Queue" 
                      count={queue.length} 
                      onClick={() => changeProfileView("queue")} 
                    />
                  </div>

                  {/* INFO & HELP LINKS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ProfileLink 
                      icon={<Settings className="w-4 h-4 text-green-500" />} 
                      label="Setup Guide" 
                      onClick={() => changeProfileView("setup")} 
                    />
                    <ProfileLink 
                      icon={<RefreshCw className="w-4 h-4 text-orange-500" />} 
                      label="Changelogs" 
                      onClick={() => changeProfileView("changelogs")} 
                    />
                    <ProfileLink 
                      icon={<Share2 className="w-4 h-4 text-blue-500" />} 
                      label="About" 
                      onClick={() => changeProfileView("about")} 
                    />
                  </div>

                  {/* QUEUE SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Play className="w-4 h-4 text-green-500" />
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Up Next / Queue</h2>
                      </div>
                      {queue.length > 0 && (
                        <button 
                          onClick={() => setQueue([])} 
                          className="text-[10px] text-white/20 uppercase font-black hover:text-brand-red transition-colors"
                        >
                          Clear Queue
                        </button>
                      )}
                    </div>
                    {queue.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {queue.map((v, idx) => (
                          <VideoCard 
                            key={`${v.id}-${idx}`} 
                            video={v} 
                            onClick={() => selectVideo(v)}
                            onWatchLater={toggleWatchLater}
                            onAddToPlaylist={(v) => addToPlaylist("My Favorites", v)}
                            onQueue={addToQueue}
                            onShare={shareVideo}
                            onChannelClick={fetchChannelContent}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Queue is empty</p>
                      </div>
                    )}
                  </div>

                  {/* WATCH LATER SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-brand-red" />
                      </div>
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Watch Later</h2>
                    </div>
                    {watchLater.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {watchLater.map((v, idx) => (
                          <VideoCard 
                            key={`${v.id}-${idx}`} 
                            video={v} 
                            onClick={() => selectVideo(v)}
                            onWatchLater={toggleWatchLater}
                            onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                            onQueue={addToQueue}
                            onShare={shareVideo}
                            onChannelClick={fetchChannelContent}
                            playlists={playlists}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Nothing saved for later</p>
                      </div>
                    )}
                  </div>

                  {/* HISTORY SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
                           <History className="w-4 h-4 text-brand-red" />
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Watch History</h2>
                      </div>
                      {history.length > 0 && (
                        <button 
                          onClick={() => setHistory([])} 
                          className="text-[10px] text-white/20 uppercase font-black hover:text-brand-red transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                    </div>

                    {history.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                        {orderHistoryByTime(history).map((h, idx) => (
                          <HistoryCard 
                            key={`${h.video.id}-${h.watchedAt}-${idx}`} 
                            item={h} 
                            onClick={() => selectVideo(h.video)} 
                            onChannelClick={fetchChannelContent}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-xs text-white/20 font-black uppercase tracking-widest italic">No history found. Start exploring!</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => window.history.back()}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black italic tracking-tighter capitalize">
                      {profileView.replace("-", " ")}
                    </h2>
                  </div>

                  {profileView === "settings" ? (
                    <div className="bg-card-dark rounded-3xl border border-border-dark p-8 space-y-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <Settings className="w-64 h-64" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">API Access Pool</label>
                              <textarea 
                                value={apiKeys}
                                onChange={(e) => setApiKeys(e.target.value)}
                                className="w-full h-32 bg-[#050505] border border-border-dark rounded-2xl p-4 text-[10px] font-mono focus:outline-none focus:border-brand-red/50 transition-all text-white/60"
                                placeholder="Enter API keys separated by commas..."
                              />
                           </div>
                           <div className="space-y-6">
                              <div>
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Content Region</label>
                                <select 
                                  value={region}
                                  onChange={(e) => setRegion(e.target.value)}
                                  className="w-full bg-[#050505] border border-border-dark rounded-2xl p-4 text-xs font-bold text-white/60 focus:outline-none focus:border-brand-red/50 transition-all appearance-none cursor-pointer"
                                >
                                  <option value="BD">Bangladesh (BD)</option>
                                  <option value="IN">India (IN)</option>
                                  <option value="US">United States (US)</option>
                                  <option value="PK">Pakistan (PK)</option>
                                  <option value="GB">United Kingdom (UK)</option>
                                  <option value="CA">Canada (CA)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Video Quality Preference</label>
                                <select 
                                  value={qualityPreference}
                                  onChange={(e) => setQualityPreference(e.target.value)}
                                  className="w-full bg-[#050505] border border-border-dark rounded-2xl p-4 text-xs font-bold text-white/60 focus:outline-none focus:border-brand-red/50 transition-all appearance-none cursor-pointer"
                                >
                                  <option value="auto">Auto (Default)</option>
                                  <option value="highres">Maximum High</option>
                                  <option value="hd1080">1080p</option>
                                  <option value="hd720">720p</option>
                                  <option value="large">480p</option>
                                  <option value="medium">360p</option>
                                </select>
                              </div>
                              <div className="space-y-4">
                                <Toggle 
                                  label="Data Saver" 
                                  desc="Optimize for 360p playback" 
                                  active={dataSaver} 
                                  onToggle={() => setDataSaver(!dataSaver)} 
                                />
                                <Toggle 
                                  label="Aggressive caching" 
                                  desc="Preload metadata & search terms" 
                                  active={aggressiveCaching} 
                                  onToggle={() => setAggressiveCaching(!aggressiveCaching)} 
                                />
                              </div>
                           </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-white/5">
                          <button 
                            onClick={saveSettings}
                            className="bg-brand-red text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-red/20"
                          >
                            Commit Changes
                          </button>
                        </div>
                    </div>
                  ) : profileView === "setup" ? (
                    <div className="bg-card-dark rounded-3xl border border-border-dark p-8 space-y-8 shadow-2xl">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                             <Settings className="w-6 h-6 text-green-500" />
                           </div>
                           <h3 className="text-xl font-black italic tracking-tight">How to Setup NanoTube</h3>
                        </div>
                        <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                          <p>Follow these steps to get NanoTube fully operational:</p>
                          <ol className="list-decimal list-inside space-y-3">
                            <li><span className="text-white font-bold">Get a YouTube Data API Key:</span> Visit the <a href="https://console.cloud.google.com/" target="_blank" className="text-brand-red underline">Google Cloud Console</a>, create a project, and enable the "YouTube Data API v3". Create an API key.</li>
                            <li><span className="text-white font-bold">Apply the Key:</span> Go to the <button onClick={() => changeProfileView("settings")} className="text-brand-red underline">Settings</button> page and paste your key into the "API Access Pool". You can add multiple keys separated by commas.</li>
                            <li><span className="text-white font-bold">Select Region:</span> Set your preferred content region (e.g., Bangladesh, USA) for trending content.</li>
                            <li><span className="text-white font-bold">Save Changes:</span> Hit "Commit Changes" to activate your settings.</li>
                          </ol>
                        </div>
                        <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                           <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Pro Tip</p>
                           <p className="text-[11px] text-white/40">If you don't have an API key, NanoTube will attempt to use fallback proxies (Piped API) or Gemini Simulation to fetch content, but the experience is best with a real key.</p>
                        </div>
                      </div>
                    </div>
                  ) : profileView === "changelogs" ? (
                    <div className="bg-card-dark rounded-3xl border border-border-dark p-8 space-y-8 shadow-2xl">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                             <RefreshCw className="w-6 h-6 text-orange-500" />
                           </div>
                           <h3 className="text-xl font-black italic tracking-tight">System Changelog</h3>
                        </div>
                        <div className="space-y-6">
                          <ChangelogEntry 
                            version="v1.4.0 (Current)"
                            date="May 12, 2026"
                            items={[
                              "Integrated Channel Profiles: Discover and follow your favorite creators",
                              "Enhanced Search: Now includes channels and videos in results",
                              "Video Quality Preference: Set default playback quality (360p to 1080p)",
                              "Real video/channel metadata fetching via YouTube Data API v3",
                              "Share functionality: Native mobile sharing and system clipboard support",
                              "Resolved YouTube Player 'playVideo' and 'seekTo' function errors",
                              "Fixed critical 'Duplicate Key' React warnings in feed and history",
                              "Added Setup Guide, Changelogs, and About sections in Profile"
                            ]}
                          />
                          <ChangelogEntry 
                            version="v1.3.0"
                            date="May 10, 2026"
                            items={[
                              "Enhanced search with real-time suggestions",
                              "Implemented robust watch history tracking with progress bars",
                              "Added Infinite Scroll for seamless content exploration",
                              "Improved UI design with high-contrast 'Elite' dark mode aesthetic"
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  ) : profileView === "about" ? (
                    <div className="bg-card-dark rounded-3xl border border-border-dark p-8 space-y-8 shadow-2xl">
                       <div className="space-y-6 text-center py-10">
                          <div className="w-20 h-20 bg-brand-red rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.3)] mx-auto mb-6">
                             <Play className="w-10 h-10 fill-white text-white" />
                          </div>
                          <h2 className="text-3xl font-black italic tracking-tighter">NanoTube Lite</h2>
                          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
                            NanoTube is a high-performance, minimalist YouTube client built for efficiency. 
                            It prioritizes a clean interface, low memory overhead, and advanced control for power users.
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-8">
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <h4 className="text-brand-red font-black text-xs uppercase tracking-widest mb-2">Efficiency</h4>
                                <p className="text-[10px] text-white/30">Built with modern React & Tailwind for sub-100ms interactions.</p>
                             </div>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <h4 className="text-brand-red font-black text-xs uppercase tracking-widest mb-2">Privacy</h4>
                                <p className="text-[10px] text-white/30">Client-side persistence only. Your history stays on your device.</p>
                             </div>
                          </div>
                          <div className="pt-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">
                             Powered by Antigravity & Google Gemini
                          </div>
                       </div>
                    </div>
                  ) : profileView === "channel" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => window.history.back()}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black italic tracking-tighter">Channel Profile</h2>
                      </div>

                      {loadingChannel ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <RefreshCw className="w-10 h-10 text-brand-red animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-4 italic">Fetching Channel Data...</p>
                        </div>
                      ) : channelData && (
                        <div className="space-y-10">
                          <div className="flex flex-col md:flex-row items-center gap-8 bg-card-dark p-8 rounded-[3rem] border border-border-dark shadow-2xl relative overflow-hidden">
                            <div className="w-32 h-32 rounded-full border-4 border-brand-red/20 shadow-2xl overflow-hidden shrink-0">
                               <SafeImage src={channelData.thumbnail!} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                               <h2 className="text-4xl font-black italic tracking-tighter">{channelData.title}</h2>
                               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                                  <span className="text-[10px] font-black uppercase text-brand-red tracking-widest">{channelData.subscriberCount} Subscribers</span>
                                  <span className="w-1 h-1 rounded-full bg-white/10" />
                                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Verified Creator</span>
                               </div>
                               <p className="text-xs text-white/40 mt-4 leading-relaxed max-w-2xl line-clamp-2">{channelData.description}</p>
                            </div>
                            <button className="bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all transform active:scale-95 shadow-xl">
                               Subscribe
                            </button>
                          </div>

                          <div className="space-y-6">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-brand-red" />
                               </div>
                               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 italic">Latest Uploads</h2>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                               {channelVideos.map((v, idx) => (
                                 <VideoCard 
                                   key={`${v.id}-${idx}`} 
                                   video={v} 
                                   onClick={() => selectVideo(v)}
                                   onWatchLater={toggleWatchLater}
                                   onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                                   onQueue={addToQueue}
                                   onShare={shareVideo}
                                   onChannelClick={(cid) => fetchChannelContent(cid)}
                                   playlists={playlists}
                                 />
                               ))}
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {profileView === "history" ? (
                        orderHistoryByTime(history).map((h, idx) => (
                            <VideoCard 
                              key={`${h.video.id}-${h.watchedAt}-${idx}`} 
                              video={h.video} 
                              onClick={() => selectVideo(h.video)}
                              onWatchLater={toggleWatchLater}
                              onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                              onQueue={addToQueue}
                              onShare={shareVideo}
                              onChannelClick={fetchChannelContent}
                              playlists={playlists}
                            />
                        ))
                      ) : profileView === "watch-later" ? (
                        watchLater.map((v, idx) => (
                          <VideoCard 
                            key={`${v.id}-${idx}`} 
                            video={v} 
                            onClick={() => selectVideo(v)}
                            onWatchLater={toggleWatchLater}
                            onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                            onQueue={addToQueue}
                            onShare={shareVideo}
                            onChannelClick={fetchChannelContent}
                            playlists={playlists}
                          />
                        ))
                      ) : profileView === "queue" ? (
                        queue.map((v, idx) => (
                          <VideoCard 
                            key={`${v.id}-${idx}`} 
                            video={v} 
                            onClick={() => selectVideo(v)}
                            onWatchLater={toggleWatchLater}
                            onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                            onQueue={addToQueue}
                            onShare={shareVideo}
                            onChannelClick={fetchChannelContent}
                            playlists={playlists}
                          />
                        ))
                      ) : profileView === "playlists" ? (
                        <>
                          <div className="col-span-full mb-8">
                            <div className="bg-card-dark p-6 rounded-3xl border border-border-dark flex flex-col md:flex-row items-center gap-4">
                              <div className="relative flex-1 w-full">
                                <ListPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input 
                                  value={newPlaylistName}
                                  onChange={(e) => setNewPlaylistName(e.target.value)}
                                  placeholder="New playlist name..."
                                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-brand-red/50 transition-all"
                                  onKeyDown={(e) => e.key === 'Enter' && createPlaylist(newPlaylistName)}
                                />
                              </div>
                              <button 
                                onClick={() => createPlaylist(newPlaylistName)}
                                className="w-full md:w-auto bg-brand-red text-white py-3 px-8 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
                              >
                                Create Playlist
                              </button>
                            </div>
                          </div>
                          {Object.entries(playlists).map(([name, list]) => (
                            <div key={name} className="col-span-full space-y-4 mb-10">
                              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3 italic">
                                <span className="w-8 h-[1px] bg-brand-red" />
                                {name}
                                <span className="text-[10px] text-white/10 ml-2">({(list as Video[]).length} videos)</span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(list as Video[]).map((v, idx) => (
                                  <VideoCard 
                                    key={`${v.id}-${idx}`} 
                                    video={v} 
                                    onClick={() => selectVideo(v)}
                                    onWatchLater={toggleWatchLater}
                                    onAddToPlaylist={(v, pName) => addToPlaylist(pName || "My Favorites", v)}
                                    playlists={playlists}
                                    onQueue={addToQueue}
                                    onShare={shareVideo}
                                    onChannelClick={fetchChannelContent}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : null}
                      
                      {((profileView === "history" && history.length === 0) || 
                        (profileView === "watch-later" && watchLater.length === 0) || 
                        (profileView === "queue" && queue.length === 0) ||
                        (profileView === "playlists" && Object.keys(playlists).length === 0)) && (
                        <div className="col-span-full py-20 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                           <p className="text-xs text-white/20 uppercase font-black tracking-widest">No items found in this collection</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <ActionButton icon={<RefreshCw className="w-4 h-4" />} label="Flush Metadata" onClick={() => {}} />
                    <ActionButton icon={<Trash2 className="w-4 h-4" />} label="Clear Image Cache" red onClick={() => {}} />
                    <ActionButton icon={<History className="w-4 h-4" />} label="Factory Reset" onClick={() => {}} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <InterstitialAd
  open={showAdModal}
  onClose={() => {

    setShowAdModal(false);

    if (pendingVideo) {

      setSelectedVideo(pendingVideo);

      window.history.pushState(
        {
          tab: activeTab,
          view: profileView,
          video: pendingVideo.id,
        },
        ""
      );

      setPendingVideo(null);
    }
  }}
/>
      </main>

     <nav
  className={`h-20 bg-card-dark border-t border-border-dark flex items-center justify-center gap-16 md:gap-32 z-50 backdrop-blur-md shrink-0 transition-all duration-300 ${
    keyboardOpen
      ? "translate-y-full opacity-0"
      : "translate-y-0 opacity-100"
  }`}
>
        <NavButton 
          icon={<Play className="w-6 h-6" />} 
          label="Home" 
          active={activeTab === "home"} 
          onClick={() => changeTab("home")} 
        />
        <NavButton
  icon={<Search className="w-6 h-6" />}
  label="Search"
  active={activeTab === "search"}
  onClick={() => {
    changeTab("search");
  }}
/>
<NavButton
  icon={<Play className="w-6 h-6" />}
  label="Shorts"
  active={activeTab === "shorts"}
  onClick={() => changeTab("shorts")}
/>
        <NavButton 
  icon={<User className="w-6 h-6" />} 
  label="Profile"
  active={activeTab === "profile"}
  onClick={() => changeTab("profile")} 
/>

</nav>
</div>
);
}

function ProfileLink({ icon, label, count, onClick }: { icon: React.ReactNode, label: string, count?: number, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <div className="text-white/40 group-hover:text-brand-red transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{label}</p>
      {count !== undefined && <p className="text-[10px] font-mono text-brand-red mt-1">{count}</p>}
    </div>
  );
}

function orderHistoryByTime(items: HistoryItem[]) {
  return [...items].sort((a, b) => b.watchedAt - a.watchedAt);
}

function ChangelogEntry({ version, date, items }: { version: string, date: string, items: string[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-white italic tracking-tighter">{version}</h4>
        <span className="text-[10px] font-mono text-white/20 uppercase">{date}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[11px] text-white/50 leading-relaxed">
            <span className="text-brand-red font-black">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const PlayerView: React.FC<{ 
  video: Video, 
  onClose: () => void, 
  related: Video[], 
  initialTime?: number, 
  onProgress?: (t: number, v: Video) => void,
  onWatchLater: (v: Video) => void,
  onAddToPlaylist: (v: Video, name?: string) => void,
  onQueue: (v: Video) => void,
  onShare: (v: Video) => void,
  onNavigateSettings: () => void,
  onChannelClick?: (channelId: string) => void,
  playlists: Record<string, Video[]>,
  qualityPreference?: string
}> = ({ video, onClose, related, initialTime, onProgress, onWatchLater, onAddToPlaylist, onQueue, onShare, onNavigateSettings, onChannelClick, playlists, qualityPreference }) => {
  const [activeVideo, setActiveVideo] = useState(video);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [fullDetails, setFullDetails] = useState<Partial<Video>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  const playerRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ytPlayerContainerRef = React.useRef<HTMLDivElement>(null);
  const controlsTimeout = React.useRef<any>(null);

//Fullscreen hide navbar 
  useEffect(() => {

  const handleFullscreen = async () => {

    const isFs = !!document.fullscreenElement;

    setIsFullscreen(isFs);

    try {

      if (isFs) {

        await Immersive.enable();

      } else {

        await Immersive.disable();

      }

    } catch (err) {

      console.log("Immersive mode error", err);

    }

  };

  document.addEventListener(
    "fullscreenchange",
    handleFullscreen
  );

  return () => {

    document.removeEventListener(
      "fullscreenchange",
      handleFullscreen
    );

  };

}, []);

  // Fetch full details when video changes
  useEffect(() => {
    const fetchDetails = async () => {
      const savedKeys = localStorage.getItem("nanotube_api_keys") || "";
      const keys = savedKeys.split(",").map(k => k.trim()).filter(k => k);
      const apiKey = keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;
      
      if (!apiKey) return;

      setLoadingDetails(true);
      try {
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${activeVideo.id}&key=${apiKey}`;
        const res = await fetch(videoUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items[0]) {
            const item = data.items[0];
            const stats = item.statistics;
            const snippet = item.snippet;
            
            // Try fetch channel thumbnail too
            let chanThumb = "";
            try {
              const chanUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${snippet.channelId}&key=${apiKey}`;
              const chanRes = await fetch(chanUrl);
              if (chanRes.ok) {
                const chanData = await chanRes.json();
                chanThumb = chanData.items?.[0]?.snippet?.thumbnails?.default?.url || "";
              }
            } catch (e) {}

            setFullDetails({
               description: snippet.description,
               likes: stats.likeCount ? (parseInt(stats.likeCount) >= 1000 ? (parseInt(stats.likeCount)/1000).toFixed(1) + "K" : stats.likeCount) : "0",
               channelThumbnail: chanThumb
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch full video details", e);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
    setFullDetails({});
    setShowFullDesc(false);
  }, [activeVideo.id]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player || !ytPlayerContainerRef.current) return;
      
      // Clear previous player if any
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch(e) {}
        playerRef.current = null;
      }

      // Re-create the div because destroy() might have removed it
      const playerDiv = document.createElement('div');
      playerDiv.id = 'main-yt-player';
      playerDiv.className = 'w-full h-full';
      ytPlayerContainerRef.current.innerHTML = '';
      ytPlayerContainerRef.current.appendChild(playerDiv);

      playerRef.current = new (window as any).YT.Player('main-yt-player', {
        videoId: activeVideo.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          showinfo: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin
        },
        events: {
          'onReady': (event: any) => {
            setDuration(event.target.getDuration());
            if (initialTime) event.target.seekTo(initialTime, true);
            if (qualityPreference && qualityPreference !== "auto") {
              event.target.setPlaybackQuality(qualityPreference);
            }
            event.target.playVideo(); // Force play on ready
          },
          'onStateChange': (event: any) => {
            setIsPlaying(event.data === (window as any).YT.PlayerState.PLAYING);
            if (event.data === (window as any).YT.PlayerState.ENDED) {
               // Handle end if needed
            }
          },
          'onError': (e: any) => {
            console.error("YT Player Error:", e.data);
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = Math.floor(playerRef.current.getCurrentTime());
        setCurrentTime(time);
        onProgress?.(time, activeVideo);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVideo.id]);

  const togglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.pauseVideo !== 'function') return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds: number) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

   const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await ScreenOrientation.lock({
        orientation: 'landscape'
      });

      await containerRef.current?.requestFullscreen();

      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();

      await ScreenOrientation.lock({
        orientation: 'portrait'
      });

      setIsFullscreen(false);
    }
  } catch (e) {
    console.warn("Fullscreen error:", e);
  }
};

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h > 0 ? h : null, m, s].filter(x => x !== null).map(x => x!.toString().padStart(2, '0')).join(':');
  };

  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#050505] z-[100] flex flex-col overflow-y-auto"
    >
      <div className="max-w-[1400px] mx-auto w-full p-4 lg:p-8 space-y-8">
        <button 
          onClick={onClose}
          className="flex items-center gap-3 text-white/30 hover:text-brand-red transition-all font-black text-[10px] uppercase tracking-[0.2em] italic group"
        >
          <div className="p-2 bg-white/5 rounded-full group-hover:bg-brand-red/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Feed
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* PLAYER SECTION */}
          <div className="lg:col-span-8 space-y-8">
            <div 
              ref={containerRef}
              onMouseMove={handleInteraction}
              onTouchStart={handleInteraction}
              className={`aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative group ${isFullscreen ? 'rounded-none border-0' : ''}`}
            >
              <div ref={ytPlayerContainerRef} className="w-full h-full pointer-events-none" />

              {/* CUSTOM CONTROLS OVERLAY */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4 md:p-8"
                  >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-bold text-sm md:text-lg line-clamp-1 flex-1 pr-4">{activeVideo.title}</h2>
                    </div>

                    {/* Center Controls */}
                    <div className="flex items-center justify-center gap-8 md:gap-16">
                      <button onClick={() => seek(-10)} className="p-3 hover:bg-white/10 rounded-full transition-all active:scale-90 group">
                        <RotateCcw className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-brand-red transition-colors" />
                        <span className="absolute mt-12 text-[10px] font-black uppercase text-white/40 left-1/2 -translate-x-1/2">10s</span>
                      </button>
                      <button onClick={togglePlay} className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-black group">
                        {isPlaying ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-black" /> : <Play className="w-8 h-8 md:w-10 md:h-10 fill-black translate-x-1" />}
                      </button>
                      <button onClick={() => seek(10)} className="p-3 hover:bg-white/10 rounded-full transition-all active:scale-90 group relative">
                        <Forward className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-brand-red transition-colors" />
                        <span className="absolute mt-1 text-[10px] font-black uppercase text-white/40 left-1/2 -translate-x-1/2">10s</span>
                      </button>
                    </div>

                    {/* Bottom Bar */}
                    <div className="space-y-4">
                      {/* Seek Bar */}
                      <div className="relative h-1.5 md:h-2 bg-white/20 rounded-full cursor-pointer group" onClick={(e) => {
                        if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        playerRef.current.seekTo(pos * duration, true);
                      }}>
                        <div 
                          className="absolute h-full bg-brand-red rounded-full shadow-[0_0_15px_#ff0000]" 
                          style={{ width: `${(currentTime / duration) * 100}%` }} 
                        />
                        <div 
                          className="absolute h-4 w-4 bg-white rounded-full -top-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="text-[10px] md:text-xs font-mono font-bold text-white/80">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                          <div className="flex items-center gap-2 group/vol">
                            <button onClick={() => {
                              if (!playerRef.current || typeof playerRef.current.mute !== 'function') return;
                              setIsMuted(!isMuted);
                              playerRef.current[isMuted ? 'unMute' : 'mute']();
                            }}>
                              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                            </button>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={isMuted ? 0 : volume} 
                              onChange={(e) => {
                                if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
                                const v = parseInt(e.target.value);
                                setVolume(v);
                                if (v > 0) {
                                  setIsMuted(false);
                                  playerRef.current.unMute();
                                }
                                playerRef.current.setVolume(v);
                              }}
                              className="w-0 group-hover/vol:w-20 md:group-hover/vol:w-24 transition-all accent-brand-red h-1 rounded-full cursor-pointer overflow-hidden"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                          <button onClick={() => seek(10)} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"><SkipForward className="w-5 h-5 text-white" /></button>
                          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-6 bg-card-dark rounded-[2.5rem] border border-border-dark p-8 shadow-2xl">
              <div className="space-y-2">
                 <h1 className="text-2xl font-black tracking-tighter leading-tight">{activeVideo.title}</h1>
                 <div className="flex items-center gap-2 text-[11px] font-mono text-white/20 uppercase tracking-widest">
                   <span>{activeVideo.views}</span>
                   <span className="w-1 h-1 rounded-full bg-white/10" />
                   <span>{activeVideo.time}</span>
                 </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer hover:border-brand-red transition-all"
                    onClick={() => {
                      if (activeVideo.channelId && onChannelClick) {
                        onChannelClick(activeVideo.channelId);
                      } else {
                        onClose();
                      }
                    }}
                  >
                    {fullDetails.channelThumbnail ? (
                      <SafeImage src={fullDetails.channelThumbnail} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="font-black text-brand-red text-lg">{activeVideo.channel[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 
                      className="font-black text-sm tracking-tight text-white cursor-pointer hover:text-brand-red transition-colors"
                      onClick={() => {
                        if (activeVideo.channelId && onChannelClick) {
                          onChannelClick(activeVideo.channelId);
                        } else {
                          onClose();
                        }
                      }}
                    >
                      {activeVideo.channel}
                    </h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Verified Channel</p>
                  </div>
                  <button className="ml-4 bg-white text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all transform active:scale-95">
                    Subscribe
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] uppercase font-black border transition-all ${isLiked ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} /> {fullDetails.likes || "Like"}
                  </button>
                  <button 
                    onClick={() => onShare(activeVideo)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] uppercase font-black bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div 
                className={`group bg-white/5 rounded-3xl p-6 transition-all hover:bg-white/10 ${showFullDesc ? '' : 'cursor-pointer'}`} 
                onClick={() => !showFullDesc && setShowFullDesc(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Video Description</h4>
                  {showFullDesc && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowFullDesc(false); }}
                      className="text-[9px] font-black uppercase text-brand-red"
                    >
                      Hide
                    </button>
                  )}
                </div>
                <p className={`text-[13px] text-white/70 leading-relaxed font-medium whitespace-pre-wrap ${showFullDesc ? '' : 'line-clamp-3'}`}>
                  {fullDetails.description || activeVideo.description || "Loading detailed description..."}
                </p>
                {!showFullDesc && (
                  <button className="text-[11px] text-brand-red font-black uppercase tracking-widest mt-3">
                    Show More
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RELATED VIDEOS SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 italic mb-4">Related Content</h2>
            <div className="space-y-4">
              {related.map((v, idx) => (
                <motion.div 
                  key={`${v.id}-${idx}`} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 cursor-pointer group hover:bg-white/5 p-2 rounded-2xl transition-all"
                  onClick={() => { 
                    setActiveVideo(v);
                    window.scrollTo({ top: 0, behavior: "smooth" }); 
                  }}
                >
                  <div className="w-40 h-24 bg-[#151515] rounded-xl relative shrink-0 overflow-hidden shadow-md">
                    <SafeImage src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 py-0.5 rounded-md font-bold">{v.duration}</span>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="text-[13px] font-bold line-clamp-2 leading-tight text-white/90 group-hover:text-brand-red transition-colors flex-1">{v.title}</h3>
                      <VideoMenu 
                        video={v} 
                        onWatchLater={onWatchLater} 
                        onAddToPlaylist={onAddToPlaylist} 
                        onQueue={onQueue} 
                        onShare={onShare} 
                        playlists={playlists}
                      />
                    </div>
                    <p className="text-[11px] text-white/40 mt-1 hover:text-white transition-colors truncate">{v.channel}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{v.views} • {v.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const SearchOverlay: React.FC<{ 
  query: string, 
  setQuery: (q: string) => void, 
  suggestions: string[], 
  history: string[],
  onSearch: (q: string) => void, 
  onClose: () => void 
}> = ({ query, setQuery, suggestions, history, onSearch, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0F0F0F] z-[200] flex flex-col"
    >
      <div className="flex items-center gap-2 p-3 border-b border-white/5">
        <button 
          onClick={onClose}
          className="p-2 text-white/70 active:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center bg-[#212121] rounded-full px-4 overflow-hidden focus-within:ring-1 focus-within:ring-brand-red/50">
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="Search YouTube"
            className="flex-1 py-2 text-[16px] text-white placeholder-white/40 bg-transparent focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-white/40 hover:text-white">
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          )}
        </div>
        <button className="p-2.5 bg-[#212121] rounded-full text-white/70 active:bg-white/10">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {(query ? suggestions : history).map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSearch(s)}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
          >
            {query ? <Search className="w-5 h-5 text-white/40" /> : <History className="w-5 h-5 text-white/40" />}
            <span className="flex-1 text-[15px] text-white/80 font-medium truncate">{s}</span>
            <div 
              className="p-2 -mr-2 opacity-40 hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setQuery(s);
              }}
            >
              <ArrowLeft className="w-5 h-5 rotate-[135deg]" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

const HistoryCard: React.FC<{ item: HistoryItem, onClick: () => void, onChannelClick?: (cid: string) => void }> = ({ item, onClick, onChannelClick }) => {
  const percent = Math.min(100, Math.max(0, (item.progress / (item.duration || 1)) * 100)) || 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-shrink-0 w-48 snap-start cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-video relative rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
        <SafeImage src={item.video.thumbnail} className="w-full h-full object-cover" alt="" />
        <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 py-0.5 rounded-md font-bold">{item.video.duration}</div>
        
        {/* PROGRESS BAR */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-brand-red shadow-[0_0_8px_#ff0000]" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="text-[12px] font-bold text-white/90 line-clamp-2 leading-tight group-hover:text-brand-red transition-colors">{item.video.title}</h3>
        <p 
          className="text-[10px] text-white/40 font-medium truncate hover:text-brand-red transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (item.video.channelId) onChannelClick?.(item.video.channelId);
          }}
        >
          {item.video.channel}
        </p>
      </div>
    </motion.div>
  );
}

function SafeImage({ src, alt, className }: { src: string, alt: string, className: string }) {
  const [error, setError] = useState(false);
  const [retryWithMq, setRetryWithMq] = useState(false);

  useEffect(() => {
    setError(false);
    setRetryWithMq(false);
  }, [src]);

  const handleError = () => {
    if (!retryWithMq) {
      setRetryWithMq(true);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className={`${className} bg-white/5 flex items-center justify-center`}>
        <Play className="w-8 h-8 text-white/10" />
      </div>
    );
  }

  const finalSrc = retryWithMq ? src.replace('hqdefault.jpg', 'mqdefault.jpg') : src;

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

const VideoMenu: React.FC<{ 
  video: Video, 
  onWatchLater: (v: Video) => void, 
  onAddToPlaylist: (v: Video, playlistName?: string) => void, 
  onQueue: (v: Video) => void, 
  onShare: (v: Video) => void,
  playlists: Record<string, Video[]>
}> = ({ video, onWatchLater, onAddToPlaylist, onQueue, onShare, playlists }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "playlists">("main");

  useEffect(() => {
    if (!isOpen) setMenuView("main");
  }, [isOpen]);

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 px-2 hover:bg-white/10 rounded-full transition-colors opacity-100"
      >
        <MoreVertical className="w-4 h-4 text-white/60" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-xl shadow-2xl border border-white/10 z-[110] overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto">
                {menuView === "main" ? (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQueue(video); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-xs font-bold text-white/80 transition-colors"
                    >
                      <Play className="w-4 h-4 text-brand-red" /> Add to queue
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onWatchLater(video); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-xs font-bold text-white/80 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-brand-red" /> Save to Watch later
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuView("playlists"); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-xs font-bold text-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ListPlus className="w-4 h-4 text-brand-red" /> Save to playlist
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </button>
                    <div className="h-[1px] bg-white/5 mx-2" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); onShare(video); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-xs font-bold text-white/80 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-white/40" /> Share
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`);
                        setIsOpen(false);
                        alert("Link copied!");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-xs font-bold text-white/80 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/40" /> Copy link
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-white/5 flex items-center gap-2 border-b border-white/5">
                      <button onClick={(e) => { e.stopPropagation(); setMenuView("main"); }} className="p-1 hover:bg-white/10 rounded-md">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Playlist</span>
                    </div>
                    {Object.keys(playlists).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-[10px] font-medium text-white/20">No playlists found</p>
                      </div>
                    ) : (
                      Object.keys(playlists).map((name) => (
                        <button 
                          key={name}
                          onClick={(e) => { e.stopPropagation(); onAddToPlaylist(video, name); setIsOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-[11px] font-bold text-white/80 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="w-2 h-2 rounded-full bg-brand-red/40" />
                          <span className="truncate">{name}</span>
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoCard: React.FC<{ 
  video: Video, 
  onClick: () => void,
  onWatchLater: (v: Video) => void,
  onAddToPlaylist: (v: Video, name?: string) => void,
  onQueue: (v: Video) => void,
  onShare: (v: Video) => void,
  playlists: Record<string, Video[]>,
  onChannelClick?: (channelId: string) => void
}> = ({ video, onClick, onWatchLater, onAddToPlaylist, onQueue, onShare, playlists, onChannelClick }) => {
  const isChannel = video.type === 'channel';

  if (isChannel) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex flex-col items-center text-center p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-xl active:scale-95"
        onClick={() => onChannelClick?.(video.id)}
      >
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-2 border-brand-red transition-transform group-hover:scale-105 shadow-2xl">
          <SafeImage src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-sm font-black italic tracking-tighter line-clamp-1">{video.title}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">Channel • View Profile</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col group cursor-pointer active:bg-white/5 transition-all p-2 rounded-xl" 
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden rounded-xl bg-[#151515] shadow-lg">
        <SafeImage 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white">
          {video.duration}
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
           </div>
        </div>
      </div>
      
      <div className="mt-3 flex gap-3">
        <div 
          className="w-9 h-9 rounded-full bg-white/5 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer hover:border-brand-red transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (video.channelId) onChannelClick?.(video.channelId);
          }}
        >
           <span className="text-xs font-black text-brand-red">{video.channel[0]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-1 items-start">
            <h3 className="text-sm font-bold leading-tight text-white/90 line-clamp-2 mb-1 group-hover:text-brand-red transition-colors flex-1">
              {video.title}
            </h3>
            <VideoMenu 
              video={video} 
              onWatchLater={onWatchLater} 
              onAddToPlaylist={onAddToPlaylist}
              onQueue={onQueue}
              onShare={onShare}
              playlists={playlists}
            />
          </div>
          <div className="text-[11px] text-white/40 font-medium">
             <p 
               className="hover:text-brand-red transition-colors uppercase tracking-widest text-[9px] font-black cursor-pointer"
               onClick={(e) => {
                 e.stopPropagation();
                 if (video.channelId) onChannelClick?.(video.channelId);
               }}
             >
               {video.channel}
             </p>
             <p className="mt-0.5 text-[10px]">{video.views} • {video.time}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Toggle({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle?: () => void }) {
  return (
    <div 
      className="flex items-center justify-between p-5 bg-black/40 rounded-[2rem] border border-white/5 cursor-pointer hover:bg-white/5 transition-all group"
      onClick={onToggle}
    >
      <div>
        <h4 className="text-sm font-black group-hover:text-brand-red transition-colors italic">{label}</h4>
        <p className="text-[10px] text-white/20 font-medium">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1.5 transition-all ${active ? "bg-brand-red shadow-[0_0_12px_rgba(255,0,0,0.4)]" : "bg-white/10"}`}>
        <div className={`h-full aspect-square bg-white rounded-full shadow-lg transition-all ${active ? "ml-auto" : "ml-0"}`} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, red = false, onClick }: { icon: React.ReactNode, label: string, red?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest font-black border transition-all active:scale-95 ${red ? "bg-brand-red/10 border-brand-red/20 text-brand-red hover:bg-brand-red/20" : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"}`}
    >
      {icon} {label}
    </button>
  );
}

function NavButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 transition-all outline-none ${active ? "opacity-100" : "opacity-20 hover:opacity-100"}`}
    >
      <div className={active ? "text-brand-red drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]" : "text-white"}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${active ? "text-white" : "text-inherit"}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-pill" 
          className="absolute -bottom-3 w-1.5 h-1.5 bg-brand-red rounded-full" 
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}
