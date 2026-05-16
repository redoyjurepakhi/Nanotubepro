import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  ThumbsUp, 
  Share2, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Volume2,
  VolumeX,
  MoreVertical,
  Clock,
  ListPlus,
  RefreshCw,
  Search
} from "lucide-react";

interface ShortVideo {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  thumbnail: string;
  views: string;
  likes: string;
}

export default function ShortsScreen() {
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys] = useState<string>(() => localStorage.getItem("nanotube_api_keys") || "");
  const [region] = useState<string>(() => localStorage.getItem("nanotube_region") || "US");

  const fetchShorts = async () => {
    setLoading(true);
    setError(null);

    const getApiKey = () => {
      const keys = apiKeys.split(",").map(k => k.trim()).filter(k => k);
      return keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;
    };

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("API Key Required for Shorts. Please check settings.");
      setLoading(false);
      return;
    }

    try {
      // Randomize search query for variety
      const keywords = ["shorts", "trending", "funny", "gaming", "music", "viral", "challenge", "comedy", "vlog", "tech"];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const pageToken = Math.random() > 0.5 ? "" : "&pageToken=CBQQAA"; // Very basic randomization of page
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${randomKeyword}+%23shorts&type=video&videoDuration=short&key=${apiKey}&regionCode=${region}${pageToken}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error("Failed to fetch shorts");
      }

      const data = await res.json();
      const items = (data.items || []).filter((i: any) => i.id.videoId);

      // Randomize the order of items received
      const shuffled = items.sort(() => Math.random() - 0.5);

      // Need to fetch video stats for likes/views
      const videoIds = shuffled.map((i: any) => i.id.videoId).join(",");
      const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`);
      const statsData = await statsRes.json();
      const statsMap = (statsData.items || []).reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.statistics;
        return acc;
      }, {});

      const transformed: ShortVideo[] = shuffled.map((item: any) => {
        const id = item.id.videoId;
        const stats = statsMap[id] || {};
        return {
          id,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          views: stats.viewCount ? (parseInt(stats.viewCount) >= 1000000 ? (parseInt(stats.viewCount)/1000000).toFixed(1) + "M" : (parseInt(stats.viewCount)/1000).toFixed(1) + "K") : "0",
          likes: stats.likeCount ? (parseInt(stats.likeCount) >= 1000 ? (parseInt(stats.likeCount)/1000).toFixed(1) + "K" : stats.likeCount) : "0"
        };
      });

      setShorts(transformed);
    } catch (e: any) {
      setError(e.message || "Something went wrong while fetching shorts.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const currentVideo = shorts[currentIndex];
    if (!currentVideo) return;

    const shareUrl = `https://www.youtube.com/shorts/${currentVideo.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentVideo.title,
          text: `Check out this short from ${currentVideo.channel} on NanoTube!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Fallback sharing failed:", err);
      }
    }
  };

  useEffect(() => {
    fetchShorts();
  }, [apiKeys, region]);

  if (loading && shorts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black">
        <RefreshCw className="w-10 h-10 text-brand-red animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Loading Shorts Feed...</p>
      </div>
    );
  }

  if (error && shorts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black p-8 text-center">
        <Play className="w-12 h-12 text-brand-red mb-6" />
        <h2 className="text-xl font-black italic tracking-tighter mb-2">Shorts Connectivity Issue</h2>
        <p className="text-white/40 text-xs max-w-xs">{error}</p>
        <button 
          onClick={fetchShorts}
          className="mt-6 bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-xl active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-black relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-6 z-50 pointer-events-none">
        <span className="text-lg font-black italic tracking-tighter flex items-center gap-2 drop-shadow-lg">
          <Play className="w-5 h-5 fill-brand-red text-brand-red" />
          Shorts
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {shorts.length > 0 && (
            <ShortVideoPlayer 
              key={shorts[currentIndex].id}
              video={shorts[currentIndex]}
              onNext={() => currentIndex < shorts.length - 1 && setCurrentIndex(currentIndex + 1)}
              onPrev={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              hasMore={currentIndex < shorts.length - 1}
              hasPrev={currentIndex > 0}
            />
          )}
        </AnimatePresence>

        {!loading && (
          <div className="absolute right-6 bottom-32 flex flex-col items-center gap-8 z-40">
            <div onClick={handleShare}>
              <ActionButton 
                icon={<Share2 className="w-6 h-6" />} 
                label="Share" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ShortVideoPlayerProps {
  video: ShortVideo;
  onNext: () => void;
  onPrev: () => void;
  hasMore: boolean;
  hasPrev: boolean;
}

const ShortVideoPlayer: React.FC<ShortVideoPlayerProps> = ({ video, onNext, onPrev, hasMore, hasPrev }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // YouTube IFrame API initialization (shared if needed, but here simple implementation)
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      
      const playerDivId = `shorts-player-${video.id}`;
      playerRef.current = new (window as any).YT.Player(playerDivId, {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: video.id, // required for loop
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          showinfo: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          'onReady': (event: any) => {
            event.target.playVideo();
            if (isMuted) event.target.mute();
          },
          'onStateChange': (event: any) => {
            setIsPlaying(event.data === (window as any).YT.PlayerState.PLAYING);
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      setTimeout(initPlayer, 100);
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [video.id]);

  const togglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.pauseVideo !== "function") return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!playerRef.current || typeof playerRef.current.mute !== "function") return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -100 && hasMore) {
          onNext();
        } else if (info.offset.y > 100 && hasPrev) {
          onPrev();
        }
      }}
      className="absolute inset-0 flex items-center justify-center bg-black cursor-grab active:cursor-grabbing"
    >
      <div className="w-full max-w-[450px] aspect-[9/16] bg-black rounded-[2.5rem] relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 mx-auto">
        {/* PLAYER CONTAINER */}
        <div id={`shorts-player-${video.id}`} className="w-full h-full pointer-events-none" />

        {/* OVERLAY CONTROLS */}
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-6">
          <div className="flex justify-end">
            <button 
              onClick={toggleMute}
              className="p-3 bg-white/10 backdrop-blur-lg rounded-full active:scale-90 transition-all text-white border border-white/5"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div 
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <AnimatePresence>
              {!isPlaying && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 2 }}
                  className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
                >
                  <Play className="w-10 h-10 fill-white text-white translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center font-black text-white shrink-0 overflow-hidden border-2 border-white/20">
                {video.channel[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-black text-sm tracking-tight truncate">{video.channel}</h4>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Verified Channel</p>
              </div>
              <button className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ring-4 ring-white/10 active:scale-95 transition-all">
                Sub
              </button>
            </div>
            <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">
              {video.title}
            </h3>
            
            {/* PROGRESS BAR */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                 className="h-full bg-brand-red shadow-[0_0_10px_#ff0000]"
               />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform active:scale-90">
      <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/5 text-white/80 group-hover:bg-brand-red group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{label}</p>
    </div>
  );
}
