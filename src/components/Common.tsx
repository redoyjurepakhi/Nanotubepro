import React, { useState, useEffect } from "react";
import { Play, MoreVertical, Share2, Clock, ListPlus, Copy, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface Video {
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

export interface HistoryItem {
  video: Video;
  progress: number; // seconds
  duration: number; // seconds
}

export interface Subscription {
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  subscriberCount?: string;
}

export function SafeImage({ src, alt, className }: { src: string, alt: string, className: string }) {
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

export const VideoMenu: React.FC<{ 
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
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`).catch(() => {});
                          setIsOpen(false);
                          alert("Link copied!");
                        } else {
                          setIsOpen(false);
                          alert("Share manually - clipboard not available");
                        }
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

export const VideoCard: React.FC<{ 
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

export const HistoryCard: React.FC<{ 
  item: HistoryItem, 
  onClick: () => void, 
  onChannelClick?: (cid: string) => void 
}> = ({ item, onClick, onChannelClick }) => {
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
