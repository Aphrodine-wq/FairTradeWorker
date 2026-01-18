
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Phone, History, Play, CheckCircle, Shield, Zap, Sparkles, Volume2, 
  Settings, UserPlus, FileText, Calendar, ChevronRight, StopCircle, 
  Loader2, BrainCircuit, TrendingUp, BarChart, ArrowUpRight, MessageSquare, 
  AlertCircle, LayoutDashboard, Database, Send, Mail
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CallLog } from '../types';
import { analyzeCallLogsIntelligence } from '../services/geminiService';

// --- Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

const MOCK_CALLS: CallLog[] = [
  { id: 'c1', customerName: 'Sarah Miller', phoneNumber: '(512) 555-0192', duration: '2:14', timestamp: '10m ago', summary: 'Emergency sink backup.', sentiment: 'POSITIVE', status: 'BOOKED' },
  { id: 'c2', customerName: 'Robert Vance', phoneNumber: '(512) 555-4432', duration: '1:05', timestamp: '1h ago', summary: 'Inquiry on quote status.', sentiment: 'NEUTRAL', status: 'QUALIFIED' },
  { id: 'c3', customerName: 'James Chen', phoneNumber: '(512) 555-2234', duration: '1:30', timestamp: '3h ago', summary: 'Deck project inquiry.', sentiment: 'POSITIVE', status: 'QUALIFIED' },
  { id: 'c4', customerName: 'Linda Grey', phoneNumber: '(512) 555-9012', duration: '3:45', timestamp: 'Yesterday', summary: 'HVAC outage.', sentiment: 'NEGATIVE', status: 'BOOKED' }
];

type Tab = 'LIVE' | 'INTEL' | 'TRAINING';

const AIReceptionist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('LIVE');
  const [voiceMode, setVoiceMode] = useState<'Zephyr' | 'Puck' | 'Charon'>('Zephyr');
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [intel, setIntel] = useState<any>(null);
  const [isAnalyzingIntel, setIsAnalyzingIntel] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const startLiveSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputCtx = audioContextRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceMode } } },
          systemInstruction: 'You are a professional assistant for a construction company. You answer calls, ask for the customer name, what their issue is, and where they are located. Be polite but efficient.',
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsLive(true);
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => prev + ' ' + msg.serverContent?.outputTranscription?.text);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLive(false),
          onerror: (e) => console.error(e)
        }
      });
    } catch (err) { setIsConnecting(false); }
  };

  const fetchIntel = async () => {
    setIsAnalyzingIntel(true);
    const result = await analyzeCallLogsIntelligence(MOCK_CALLS);
    setIntel(result);
    setIsAnalyzingIntel(false);
  };

  useEffect(() => {
    if (activeTab === 'INTEL' && !intel) fetchIntel();
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Phone Assistant</h1>
          <p className="text-slate-500 font-medium">Your automated office staff is online and ready.</p>
        </div>
        
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
           <TabButton active={activeTab === 'LIVE'} onClick={() => setActiveTab('LIVE')} icon={Mic} label="Status" />
           <TabButton active={activeTab === 'INTEL'} onClick={() => setActiveTab('INTEL')} icon={TrendingUp} label="Insights" />
           <TabButton active={activeTab === 'TRAINING'} onClick={() => setActiveTab('TRAINING')} icon={FileText} label="Instructions" />
        </div>
      </div>

      {activeTab === 'LIVE' && (
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-10 rounded-3xl relative overflow-hidden transition-all duration-500 shadow-sm`}>
                 <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                    {isLive ? (
                       <div className="space-y-8 w-full max-w-md">
                          <div className="flex justify-center gap-1.5 h-12 items-center">
                             {[...Array(12)].map((_, i) => (
                                <div key={i} className="w-1 bg-primary-500 rounded-full animate-pulse" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }}></div>
                             ))}
                          </div>
                          <div className="space-y-4">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assistant Active</h3>
                             <div className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium leading-relaxed">
                                {transcript || "Listening to audio stream..."}
                             </div>
                             <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setIsLive(false); }} className="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center gap-2 mx-auto text-sm">
                                <StopCircle size={18}/> Stop Listening
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-slate-100 dark:border-white/5">
                             <Volume2 size={32} className="text-slate-400" />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assistant Standby</h3>
                             <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Ready to answer calls and filter leads.</p>
                          </div>
                          <button onClick={startLiveSession} disabled={isConnecting} className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 mx-auto text-sm">
                             {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                             Test Voice Assistant
                          </button>
                       </div>
                    )}
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <History size={18} className="text-slate-500" /> Recent Calls
                    </h3>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {MOCK_CALLS.map(call => (
                       <div key={call.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${call.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}><Phone size={20}/></div>
                                <div>
                                   <div className="font-bold text-lg text-slate-900 dark:text-white">{call.customerName}</div>
                                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{call.timestamp} • {call.duration}</div>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <StatusBadge text={call.status} color={call.status === 'BOOKED' ? 'bg-emerald-600' : 'bg-slate-700'} />
                             </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-14">{call.summary}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Settings size={18} className="text-slate-500"/> Assistant Settings</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Assistant Voice</label>
                       <div className="grid grid-cols-1 gap-2">
                          {[
                            {id:'Zephyr', label:'Professional Male'}, 
                            {id:'Puck', label:'Casual/Warm Male'}, 
                            {id:'Charon', label:'Direct Female'}
                          ].map(m => (
                             <button key={m.id} onClick={() => setVoiceMode(m.id as any)} className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${voiceMode === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600' : 'border-slate-100 dark:border-white/5 text-slate-500'}`}>
                                <span className="font-bold text-sm">{m.label}</span>
                                {voiceMode === m.id && <CheckCircle size={18}/>}
                             </button>
                          ))}
                       </div>
                    </div>
                    <button className="w-full py-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs tracking-widest uppercase hover:bg-slate-50">Sync Calendar</button>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-lg relative overflow-hidden group">
                 <div className="relative z-10 space-y-4">
                    <h3 className="font-bold text-xl">Draft Replies</h3>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">The assistant drafted 3 replies for your new leads. Review them now.</p>
                    <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2">View Messages <ChevronRight size={14}/></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'INTEL' && (
        <div className="animate-fadeIn space-y-8">
           {isAnalyzingIntel ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 py-32 rounded-3xl flex flex-col items-center justify-center text-center">
                 <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analyzing Log Files...</h3>
              </div>
           ) : intel ? (
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-10 rounded-3xl shadow-sm">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Business Insights</h3>
                       
                       <div className="h-64 w-full mb-10">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={intel.sentimentTrend.map((v: number, i: number) => ({ name: `Day ${i+1}`, val: v }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip />
                                <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={3} fill="#eff6ff" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>

                       <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Common Issues</h4>
                             <div className="space-y-3">
                                {intel.topIssues.map((t: string, i: number) => (
                                   <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Follow-Ups Needed</h4>
                             <div className="space-y-3">
                                {intel.followUpActions.map((f: any, i: number) => (
                                   <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/10">
                                      <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                                      <div>
                                         <div className="text-xs font-bold text-slate-900 dark:text-white">{f.client}</div>
                                         <div className="text-xs text-slate-500 mt-1">{f.action}</div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-brand-primary text-white shadow-lg space-y-4">
                       <h3 className="font-bold text-xl">Growth Tip</h3>
                       <p className="text-blue-50 text-sm leading-relaxed">{intel.revenueOpportunity}</p>
                    </div>
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 font-bold hover:border-brand-primary transition-all flex items-center justify-center gap-2">
                       <Mail size={18}/> Email PDF Report
                    </button>
                 </div>
              </div>
           ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-32 rounded-3xl flex flex-col items-center justify-center text-center">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Insights Generated</h3>
                 <p className="text-slate-500 text-sm mb-8">Run a scan on your call logs to see common customer issues.</p>
                 <button onClick={fetchIntel} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm">Scan Call Logs</button>
              </div>
           )}
        </div>
      )}

      {activeTab === 'TRAINING' && (
        <div className="animate-fadeIn max-w-4xl mx-auto py-12 text-center space-y-12">
           <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tell the Assistant what to say</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Upload your price list or record special instructions (like "Don't book anything next Tuesday").</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm group cursor-pointer hover:border-brand-primary transition-all">
                 <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl w-fit mb-6"><FileText size={32}/></div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Service Details</h3>
                 <p className="text-slate-500 text-sm mb-8">Upload PDFs of your quotes, contracts, or price lists so the AI knows your rates.</p>
                 <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest">Upload Files</button>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm group cursor-pointer hover:border-brand-primary transition-all">
                 <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl w-fit mb-6"><Mic size={32}/></div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Voice Rules</h3>
                 <p className="text-slate-500 text-sm mb-8">Record a quick memo explaining any custom rules for booking or emergency handling.</p>
                 <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest">Record Memo</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
   <button onClick={onClick} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-brand-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
      <Icon size={14}/> {label}
   </button>
);

const StatusBadge = ({ text, color }: any) => (
   <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white ${color}`}>{text}</span>
);

export default AIReceptionist;
