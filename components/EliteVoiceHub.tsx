
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, MicOff, Volume2, X, Activity, Terminal, Loader2, Radio, BrainCircuit, ChevronRight, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserProfile } from '../types';

// --- Encoding/Decoding Helpers ---
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

interface EliteVoiceHubProps {
  onClose: () => void;
  profile: UserProfile;
}

const EliteVoiceHub: React.FC<EliteVoiceHubProps> = ({ onClose, profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [currentInputTranscript, setCurrentInputTranscript] = useState('');
  const [currentOutputTranscript, setCurrentOutputTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    sessionPromiseRef.current = null;
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = audioContextRef.current;
    const outputCtx = outputAudioContextRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;

      const systemPrompt = `You are Zephyr, the Elite Business AI for ${profile.role === 'CONTRACTOR' ? 'professional contractors' : 'homeowners'}. 
      User: ${profile.name}. Tier: ${profile.tier}. 
      Context: ${profile.role === 'CONTRACTOR' ? 'Focus on job costing, scaling, and lead strategy.' : 'Focus on maintenance tracking and hiring pros.'}
      Speak in a confident, authoritative tone. Use technical trades terminology.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: systemPrompt,
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
              sessionPromise.then(session => session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              if (!aiAnalyserRef.current) { aiAnalyserRef.current = outputCtx.createAnalyser(); aiAnalyserRef.current.fftSize = 256; }
              source.connect(aiAnalyserRef.current);
              aiAnalyserRef.current.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.inputTranscription) setCurrentInputTranscript(prev => prev + msg.serverContent!.inputTranscription!.text);
            if (msg.serverContent?.outputTranscription) setCurrentOutputTranscript(prev => prev + msg.serverContent!.outputTranscription!.text);
            if (msg.serverContent?.turnComplete) {
              setTranscript(prev => [...prev, { role: 'user', text: currentInputTranscript }, { role: 'ai', text: currentOutputTranscript }]);
              setCurrentInputTranscript(''); setCurrentOutputTranscript('');
            }
            if (msg.serverContent?.interrupted) { sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} }); sourcesRef.current.clear(); nextStartTimeRef.current = 0; }
          },
          onerror: (e) => stopSession(),
          onclose: () => stopSession()
        }
      });
      sessionPromiseRef.current = sessionPromise;

      const updateVolume = () => {
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          setVolume(data.reduce((a, b) => a + b) / data.length / 128);
        }
        if (aiAnalyserRef.current) {
          const data = new Uint8Array(aiAnalyserRef.current.frequencyBinCount);
          aiAnalyserRef.current.getByteFrequencyData(data);
          setAiVolume(data.reduce((a, b) => a + b) / data.length / 128);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) { setIsConnecting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 animate-fadeIn">
      {/* Background Ambience */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Header */}
      <div className="absolute top-10 left-10 flex items-center gap-4 z-20">
        <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand-primary border border-white/10 shadow-lg">
          <BrainCircuit className={isActive ? 'animate-pulse' : ''} size={32} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Zephyr Elite</h2>
          <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.4em] mt-1">
             {isActive ? 'LIVE CONNECTION' : 'SYSTEM STANDBY'}
          </p>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-10 right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all z-20">
         <X size={24} />
      </button>

      {/* Center Visualization */}
      <div className="relative flex items-center justify-center w-full max-w-2xl aspect-square z-10">
        {/* Dynamic Orb */}
        <div 
           className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-100 ${isActive ? 'bg-gradient-to-br from-brand-primary to-indigo-600 shadow-[0_0_60px_rgba(37,99,235,0.6)]' : 'bg-slate-800/50 border border-white/10'}`} 
           style={{ transform: `scale(${1 + (aiVolume > 0.1 ? aiVolume * 0.5 : volume * 0.3)})` }}
        >
          {isConnecting ? <Loader2 className="text-white/80 animate-spin" size={64} /> : isActive ? (
             <div className="relative">
                <div className="absolute inset-0 bg-white blur-xl opacity-50 animate-pulse"></div>
                <Radio className="text-white relative z-10" size={64} />
             </div>
          ) : (
            <button 
               onClick={startSession} 
               className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors group"
            >
               <Mic className="mb-2 group-hover:scale-110 transition-transform" size={48} />
               <span className="text-[10px] font-black uppercase tracking-widest">Tap to Speak</span>
            </button>
          )}
        </div>
        
        {/* Ripple Rings */}
        {isActive && (
           <>
              <div className="absolute inset-0 border border-brand-primary/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
           </>
        )}
      </div>

      {/* Transcript Area */}
      <div className="w-full max-w-3xl mt-8 relative z-20">
         <div className="h-48 overflow-y-auto space-y-4 scrollbar-hide px-4 mask-fade-bottom">
            {transcript.length === 0 && !isActive && (
               <div className="text-center text-slate-500 font-medium mt-12">
                  "I'm ready to discuss strategy, estimates, or schedule management."
               </div>
            )}
            
            {transcript.map((msg, i) => (
               <div key={i} className={`flex gap-4 animate-fadeIn ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl border ${msg.role === 'ai' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary rounded-tl-none' : 'bg-white/5 border-white/10 text-white rounded-tr-none'}`}>
                     <span className="text-[9px] font-black uppercase opacity-50 mb-1 block tracking-widest">{msg.role === 'ai' ? 'Zephyr' : 'You'}</span>
                     <p className="font-medium text-lg leading-relaxed">{msg.text}</p>
                  </div>
               </div>
            ))}
            
            {(currentInputTranscript || currentOutputTranscript) && (
               <div className="text-center text-slate-400 text-sm animate-pulse font-mono mt-4">
                  {currentOutputTranscript || currentInputTranscript}
               </div>
            )}
         </div>
      </div>

      {/* Footer Controls */}
      {isActive && (
         <div className="absolute bottom-10 z-20">
            <button 
               onClick={stopSession} 
               className="px-8 py-3 bg-rose-500/10 border border-rose-500/50 text-rose-500 font-bold rounded-full hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
            >
               <MicOff size={18} /> End Session
            </button>
         </div>
      )}
    </div>
  );
};

export default EliteVoiceHub;
