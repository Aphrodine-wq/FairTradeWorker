
import React, { useState, useMemo } from 'react';
import { Job, JobStatus, UserRole } from '../types';
import { 
  MapPin, Clock, Search, ChevronRight, X, Bookmark, 
  Sparkles, Loader2, AlertCircle, DollarSign, Play, 
  Flame, Zap, Trophy, Briefcase, Star, ArrowRight, Wand2, 
  CheckCircle2, XCircle, Clock as ClockIcon, ChevronDown, ShieldCheck, Filter, Lock
} from 'lucide-react';
import { generateBidSuggestion } from '../services/geminiService';

// Expanded Mock Data for "Netflix" feel
const MOCK_JOBS: Job[] = [
  { id: 'm1', title: 'Water Heater Emergency', category: 'Plumbing', description: 'Leaking tank, 50 gallon. Need swap today.', location: 'Austin, TX', budgetRange: '$1,200', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800'], postedDate: '2h ago', bidCount: 2, isUrgent: true, aiAnalysis: { complexityScore: 4, estimatedDuration: '4 hours', riskFactors: ['Tight space'] } },
  { id: 'm2', title: 'Luxury Kitchen Lighting', category: 'Electrical', description: 'Install 6 LED cans in living room.', location: 'West Lake, TX', budgetRange: '$800', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600'], postedDate: '5h ago', bidCount: 0 },
  { id: 'm3', title: 'Master Bath Remodel', category: 'Carpentry', description: 'Full demo and vanity install.', location: 'Downtown', budgetRange: '$4,500', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800'], postedDate: '1d ago', bidCount: 5 },
  { id: 'm4', title: 'Roof Patch Repair', category: 'Roofing', description: 'Missing shingles after storm.', location: 'Round Rock', budgetRange: '$600', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&q=80&w=800'], postedDate: '3h ago', bidCount: 1 },
  { id: 'm5', title: 'Smart Home Hub Setup', category: 'Electrical', description: 'Install Nest, Ring, and Smart Locks.', location: 'Domain', budgetRange: '$450', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1558002038-109155714d9d?auto=format&fit=crop&q=80&w=800'], postedDate: '30m ago', bidCount: 0, isUrgent: true },
  { id: 'm6', title: 'Fence Replacement', category: 'Carpentry', description: '50ft cedar fence replacement.', location: 'East Austin', budgetRange: '$2,800', status: JobStatus.OPEN, images: ['https://images.unsplash.com/photo-1599363025686-353664d9526a?auto=format&fit=crop&q=80&w=800'], postedDate: '6h ago', bidCount: 3 },
];

const MOCK_PROS = [
  { id: 'p1', name: 'Mike Robinson', trade: 'Master Plumber', rating: 4.9, jobs: 142, verified: true, avatar: 'M', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
  { id: 'p2', name: 'Sarah Chen', trade: 'Electrician', rating: 5.0, jobs: 89, verified: true, avatar: 'S', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
  { id: 'p3', name: 'Apex Roofing Co', trade: 'Roofing', rating: 4.8, jobs: 312, verified: true, avatar: 'A', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { id: 'p4', name: 'BuildRight LLC', trade: 'General Contractor', rating: 4.7, jobs: 56, verified: true, avatar: 'B', image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400' },
];

const MOCK_MY_BIDS = [
  { id: 'b1', title: 'Master Bath Remodel', budgetRange: '$4,200', bidStatus: 'Pending', location: 'Downtown', images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800'], postedDate: '2h ago' },
  { id: 'b2', title: 'Fence Replacement', budgetRange: '$2,650', bidStatus: 'Accepted', location: 'East Austin', images: ['https://images.unsplash.com/photo-1599363025686-353664d9526a?auto=format&fit=crop&q=80&w=800'], postedDate: '1d ago' },
  { id: 'b3', title: 'Water Heater Emergency', budgetRange: '$1,200', bidStatus: 'Rejected', location: 'Austin, TX', images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800'], postedDate: '3d ago' },
];

const JobMarketplace: React.FC<{role?: UserRole}> = ({ role }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionRationale, setSuggestionRationale] = useState<string | null>(null);
  const [myBids, setMyBids] = useState<any[]>(role !== UserRole.HOMEOWNER ? MOCK_MY_BIDS : []);

  // BLIND BIDDING: Track which contractors can see bid amounts
  const [blindBiddingEnabled] = useState(true); // Enable blind bidding by default
  const [revealedBids, setRevealedBids] = useState<Set<string>>(new Set()); // Show amounts only when job is awarded

  // Filtering State for Homeowners
  const [filterTrade, setFilterTrade] = useState('All');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const isHomeowner = role === UserRole.HOMEOWNER;
  const isContractor = role === UserRole.CONTRACTOR;

  // Derive unique trades for filter dropdown
  const uniqueTrades = useMemo(() => {
    return Array.from(new Set(MOCK_PROS.map(p => p.trade))).sort();
  }, []);

  const filteredPros = useMemo(() => {
    return MOCK_PROS.filter(p => {
        if (verifiedOnly && !p.verified) return false;
        if (p.rating < filterRating) return false;
        if (filterTrade !== 'All' && p.trade !== filterTrade) return false;
        return true;
    });
  }, [filterTrade, filterRating, verifiedOnly]);

  const isFiltered = filterTrade !== 'All' || filterRating > 0 || verifiedOnly;

  const handleAutoSuggest = async () => {
    if (!selectedJob) return;
    setIsSuggesting(true);
    setSuggestionRationale(null);
    try {
      const result = await generateBidSuggestion(selectedJob);
      if (result && result.amount) {
        setBidAmount(result.amount.toString());
        setSuggestionRationale(result.rationale);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const closeJob = () => {
    setSelectedJob(null);
    setIsBidding(false);
    setBidAmount('');
    setSuggestionRationale(null);
  };

  const handleSubmitBid = () => {
    if (!selectedJob) return;
    const newBid = {
      ...selectedJob,
      id: `bid_${Date.now()}`,
      bidStatus: 'Pending',
      budgetRange: bidAmount.startsWith('$') ? bidAmount : `$${bidAmount}`,
      postedDate: 'Just now'
    };
    setMyBids([newBid, ...myBids]);
    closeJob();
  };

  // Netflix-style horizontal row component
  const ContentRow = ({ title, items, icon: Icon, color }: any) => (
    <div className="space-y-4 mb-10 animate-fadeIn relative z-0">
       <div className="flex items-center justify-between px-1">
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
             {Icon && <Icon size={20} className={color} />} {title}
          </h3>
          <button className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest transition-colors">
             See All <ChevronRight size={14} />
          </button>
       </div>
       
       <div className="relative group/row">
          {/* Added padding to container to prevent hover clipping and improved scrollbar hiding */}
          <div className="flex gap-4 overflow-x-auto pb-8 pt-4 px-4 -mx-4 snap-x scrollbar-hide">
             {items.map((item: any) => (
                <div 
                   key={item.id}
                   onClick={() => setSelectedJob(item)}
                   className="min-w-[260px] md:min-w-[300px] snap-center md:snap-start relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-30 border border-slate-200 dark:border-white/5 flex-shrink-0"
                >
                   {/* Thumbnail Image */}
                   <div className="h-40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80"></div>
                      <img src={item.images?.[0] || item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-20 flex gap-2">
                         {item.bidStatus ? (
                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider text-white flex items-center gap-1 shadow-md ${
                                item.bidStatus === 'Accepted' ? 'bg-emerald-500' : 
                                item.bidStatus === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}>
                                {item.bidStatus === 'Accepted' && <CheckCircle2 size={10} />}
                                {item.bidStatus === 'Rejected' && <XCircle size={10} />}
                                {item.bidStatus === 'Pending' && <ClockIcon size={10} />}
                                {item.bidStatus}
                            </span>
                         ) : (
                            <>
                                {item.isUrgent && <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-pulse flex items-center gap-1"><Flame size={10}/> URGENT</span>}
                                {item.verified && <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1"><ShieldCheck size={10}/> VERIFIED</span>}
                                {!item.verified && !item.isUrgent && <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{item.category || item.trade}</span>}
                            </>
                         )}
                      </div>
                      
                      {/* Price / Rating Overlay */}
                      <div className="absolute bottom-3 left-3 z-20">
                         {isHomeowner ? (
                            <div className="flex items-center gap-1 text-white font-bold"><Star size={14} className="text-amber-400 fill-amber-400"/> {item.rating}</div>
                         ) : (
                            <div className="text-xl font-black text-white drop-shadow-md flex items-center"><span className="text-emerald-400 text-sm mr-0.5">$</span>{item.budgetRange?.replace('$','')}</div>
                         )}
                      </div>
                   </div>

                   {/* Content Body */}
                   <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight line-clamp-1">{item.title || item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">{item.description || `${item.jobs} jobs completed on platform.`}</p>
                      
                      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/5">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {item.location || 'Austin, TX'}
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-24 w-full overflow-hidden">
      
      {/* Hero Search Header */}
      <div className="relative h-[250px] md:h-[350px] rounded-[2rem] overflow-hidden mb-8 group mx-4 md:mx-0">
         <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"></div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
               {isHomeowner ? 'Find the Perfect Pro.' : 'High Value Leads.'}
               <span className="block text-blue-500 text-xl md:text-3xl mt-2">Zero Commission.</span>
            </h1>
            <div className="w-full relative group/search max-w-md">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" size={20} />
               <input 
                  type="text" 
                  placeholder={isHomeowner ? "Search 'Plumber'..." : "Search 'Kitchen'..."}
                  className="w-full pl-12 pr-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 font-bold text-sm outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-500 transition-all shadow-xl" 
               />
            </div>
         </div>
      </div>

      {/* Filter Controls for Homeowners */}
      {isHomeowner && (
        <div className="flex flex-wrap gap-3 px-4 md:px-0 mb-8 animate-fadeIn">
            {/* Trade Filter */}
            <div className="relative group">
                <select 
                    value={filterTrade}
                    onChange={(e) => setFilterTrade(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 focus:border-brand-primary outline-none cursor-pointer hover:border-brand-primary/50 transition-colors shadow-sm"
                >
                    <option value="All">All Trades</option>
                    {uniqueTrades.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-primary transition-colors">
                    <ChevronDown size={14} />
                </div>
            </div>

            {/* Rating Filter */}
            <div className="relative group">
               <select 
                    value={filterRating}
                    onChange={(e) => setFilterRating(Number(e.target.value))}
                    className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 focus:border-brand-primary outline-none cursor-pointer hover:border-brand-primary/50 transition-colors shadow-sm"
                >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                    <option value={5}>5.0 Stars</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Star size={14} className={filterRating > 0 ? "fill-amber-400 text-amber-400" : ""} />
                </div>
            </div>

            {/* Verified Toggle */}
            <button 
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${verifiedOnly ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'}`}
            >
                <ShieldCheck size={16} className={verifiedOnly ? "fill-current" : ""} /> Verified Only
            </button>

            {/* Reset */}
            {isFiltered && (
                <button 
                    onClick={() => { setFilterTrade('All'); setFilterRating(0); setVerifiedOnly(false); }}
                    className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                    <X size={14}/> Clear Filters
                </button>
            )}
        </div>
      )}

      <div className="px-0 md:px-0">
         {isHomeowner ? (
           isFiltered ? (
             <ContentRow 
               title={`Matching Professionals (${filteredPros.length})`} 
               items={filteredPros} 
               icon={Filter} 
               color="text-brand-primary" 
             />
           ) : (
             <>
               <ContentRow title="Top Rated Professionals" items={MOCK_PROS} icon={Trophy} color="text-amber-500" />
               <ContentRow title="Verified Electricians" items={MOCK_PROS.filter(p => p.trade === 'Electrician')} icon={Zap} color="text-yellow-500" />
               <ContentRow title="Master Plumbers" items={MOCK_PROS.filter(p => p.trade === 'Master Plumber')} icon={Briefcase} color="text-blue-500" />
             </>
           )
         ) : (
           <>
             {myBids.length > 0 && <ContentRow title="My Active Bids" items={myBids} icon={Briefcase} color="text-brand-primary" />}
             <ContentRow title="Trending High Value" items={MOCK_JOBS.filter(j => parseInt(j.budgetRange.replace(/\D/g,'')) > 1000)} icon={Flame} color="text-rose-500" />
             <ContentRow title="Urgent Needs" items={MOCK_JOBS.filter(j => j.isUrgent)} icon={AlertCircle} color="text-amber-500" />
             <ContentRow title="Quick Fixes" items={MOCK_JOBS.filter(j => parseInt(j.budgetRange.replace(/\D/g,'')) <= 1000)} icon={Zap} color="text-blue-500" />
           </>
         )}
      </div>

      {selectedJob && !isHomeowner && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" onClick={closeJob}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
               
               {/* Compact Header Image */}
               <div className="h-48 relative bg-slate-100 dark:bg-black shrink-0">
                  <img src={selectedJob.images[0]} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <button onClick={closeJob} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur"><X size={18}/></button>
                  <div className="absolute bottom-4 left-6 text-white">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{selectedJob.category}</div>
                      <h2 className="text-2xl font-black leading-none">{selectedJob.title}</h2>
                  </div>
               </div>
               
               {/* Scrollable Content */}
               <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  {!isBidding ? (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                                <DollarSign size={20}/> {selectedJob.budgetRange}
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedJob.bidCount} Bids</div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/10">
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-2"><Sparkles size={12}/> AI Analysis</div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {selectedJob.aiAnalysis?.riskFactors?.[0] || "Standard complexity job. Materials readily available."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedJob.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <MapPin size={12}/> {selectedJob.location}
                        </div>

                        {role === UserRole.CREW_MEMBER ? (
                           <button disabled className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4 cursor-not-allowed border border-slate-300 dark:border-white/10">
                              <Lock size={16} /> Bidding Restricted to Manager
                           </button>
                        ) : (
                           <button onClick={() => setIsBidding(true)} className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                              Start Proposal <ChevronRight size={16} />
                           </button>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setIsBidding(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={16} className="rotate-180 text-slate-500"/></button>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your Proposal</h3>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Bid Amount</label>
                              <div className="relative group">
                                 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                 <input 
                                    value={bidAmount} 
                                    onChange={e => setBidAmount(e.target.value)} 
                                    type="number" 
                                    placeholder="0.00" 
                                    autoFocus
                                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 font-bold text-xl outline-none focus:border-brand-primary" 
                                 />
                                 <button 
                                    onClick={handleAutoSuggest} 
                                    disabled={isSuggesting}
                                    title="AI Suggest Bid"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors disabled:opacity-50"
                                 >
                                    {isSuggesting ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                 </button>
                              </div>
                              {suggestionRationale && (
                                 <div className="mt-2 p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed animate-fadeIn">
                                    <span className="font-bold text-brand-primary uppercase tracking-wide mr-1">Strategy:</span> {suggestionRationale}
                                 </div>
                              )}
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Message</label>
                              <textarea 
                                 placeholder="I can help with this..." 
                                 className="w-full p-4 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 h-24 resize-none outline-none focus:border-brand-primary text-sm"
                              />
                           </div>
                        </div>

                        <button onClick={handleSubmitBid} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
                           Submit Bid <ChevronRight size={16} />
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default JobMarketplace;
