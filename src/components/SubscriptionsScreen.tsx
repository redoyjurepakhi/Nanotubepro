import React from "react";
import { motion } from "motion/react";
import { Users, ChevronRight, Search } from "lucide-react";
import { SafeImage, Subscription } from "./Common";

interface SubscriptionsScreenProps {
  subscriptions: Subscription[];
  onChannelClick: (channelId: string) => void;
  onNavigateHome: () => void;
}

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ 
  subscriptions, 
  onChannelClick,
  onNavigateHome
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-[#0A0A0A] border-b border-white/5 shrink-0 z-[60] backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-brand-red" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter">Subscriptions</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="p-8 bg-brand-red/10 rounded-full border border-brand-red/20 shadow-2xl shadow-brand-red/5">
              <Users className="w-16 h-16 text-brand-red" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black italic tracking-tighter">NO SUBSCRIPTIONS</h2>
              <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                You haven't subscribed to any channels yet. Start exploring and follow your favorite creators!
              </p>
            </div>
            <button 
              onClick={onNavigateHome}
              className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Explore Content
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 italic">
              {subscriptions.length} Channel{subscriptions.length !== 1 ? 's' : ''} Followed
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.channelId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 4 }}
                  onClick={() => onChannelClick(sub.channelId)}
                  className="flex items-center gap-4 p-4 bg-card-dark rounded-3xl border border-white/5 hover:border-brand-red/30 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-brand-red/50 transition-colors shrink-0 shadow-lg">
                    <SafeImage src={sub.thumbnail} alt={sub.channelTitle} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black italic tracking-tight group-hover:text-brand-red transition-colors truncate">
                      {sub.channelTitle}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-red/60">
                      {sub.subscriberCount || "Creator"}
                    </p>
                  </div>
                  
                  <div className="p-2 bg-white/5 rounded-full group-hover:bg-brand-red/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-red/50" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsScreen;
