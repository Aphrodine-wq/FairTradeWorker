
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Sparkles, Loader2, X, Wrench, Zap, Hammer, Thermometer, 
  Paintbrush, Home, TreePine, Eraser, CheckCircle, 
  ChevronRight, AlertCircle, Rocket, BrainCircuit, ScanLine, ArrowRight,
  UploadCloud, Trash2, Plus, Video, Package, Pencil, Check, Save, Maximize2,
  Scissors, Play, Pause, Film, Mic, StopCircle
} from 'lucide-react';
import { analyzeJobMultimodal } from '../services/geminiService';
import { Job, JobStatus, ServiceCategory } from '../types';
import { VideoPlayer } from './ui/VideoPlayer';

interface JobPosterProps {
  onJobPosted: (job: Job) => void;
}

const SERVICES: { id: ServiceCategory; label: string; icon: any }[] = [
  { id: 'Plumbing', label: 'Plumbing', icon: Wrench },
  { id: 'Electrical', label: 'Electrical', icon: Zap },
  { id: 'HVAC', label: 'HVAC', icon: Thermometer },
  { id: 'Carpentry', label: 'Carpentry', icon: Hammer },
  { id: 'Painting', label: 'Painting', icon: Paintbrush },
  { id: 'Roofing', label: 'Roofing', icon: Home },
  { id: 'Other', label: 'Yard Work', icon: TreePine },
  { id: 'Other', label: 'Cleaning', icon: Eraser },
  { id: 'Other', label: 'Handyman', icon: Sparkles },
];

const SUB_TASKS: Record<string, string[]> = {
  'Plumbing': ['Leak Repair', 'Water Heater', 'Clog Removal', 'Fixture Install', 'Pipe Reroute'],
  'Electrical': ['Lighting', 'Panel Upgrade', 'Outlet Install', 'Wiring', 'Fan Install'],
  'HVAC': ['AC Repair', 'Heater Tune-up', 'Duct Cleaning', 'Thermostat'],
  'Carpentry': ['Trim Work', 'Cabinet Repair', 'Door Install', 'Framing'],
  'Painting': ['Interior Room', 'Exterior House', 'Cabinet Painting', 'Deck Stain'],
  'Roofing': ['Leak Patch', 'Shingle Replacement', 'Inspection', 'Gutter Clean'],
  'Yard Work': ['Mowing', 'Tree Trimming', 'Landscaping', 'Debris Removal'],
  'Cleaning': ['Deep Clean', 'Move-out Clean', 'Carpet Cleaning', 'Window Wash'],
  'Handyman': ['Furniture Assembly', 'TV Mounting', 'Drywall Patch', 'General Repair'],
};

const ANALYSIS_STEPS = [
  "Scanning site conditions...",
  "Identifying required materials...",
  "Calculating labor hours...",
  "Checking local code requirements...",
  "Finalizing scope of work..."
];

const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const JobPoster: React.FC<JobPosterProps> = ({ onJobPosted }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Preview State
  const [previewMedia, setPreviewMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  
  // Trimming State
  const [trimmingSession, setTrimmingSession] = useState<{
    file: File;
    url: string;
    duration: number;
    startTime: number;
    endTime: number;
    isPlaying: boolean;
  } | null>(null);
  const trimVideoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('Uploading...');
      
      const interval = setInterval(() => {
         setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 100);

      const files = Array.from(e.target.files);
      
      const filePromises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file as Blob);
      }));

      const newImages = await Promise.all(filePromises);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('Complete');

      setTimeout(() => {
        setImages(prev => [...prev, ...newImages]);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 300);

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadError(null);
      const file = e.target.files[0]; // Handle first file for trimming

      // Client-side size validation with detailed message
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError(`The video "${file.name}" is ${sizeMB}MB. Max allowed size is ${MAX_VIDEO_SIZE_MB}MB. Please compress or trim.`);
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }

      // Start Trimming Session
      const url = URL.createObjectURL(file);
      setTrimmingSession({
        file,
        url,
        duration: 0, // Will be set on metadata load
        startTime: 0,
        endTime: 0,
        isPlaying: false
      });
      
      // Reset input immediately so we can select again if cancelled
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extract just the base64 part
          const base64 = base64String.split(',')[1];
          setAudioBase64(base64);
        };
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setUploadError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioUrl(null);
    setAudioBase64(null);
  };

  const finishVideoProcessing = async (file: File, url: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading...');
    
    // Simulate upload with stages
    const interval = setInterval(() => {
       setUploadProgress(prev => {
          const next = Math.min(prev + 5, 95);
          if (next > 20 && next < 50) setUploadStatus('Processing...');
          if (next >= 50 && next < 80) setUploadStatus('Analyzing Audio...');
          if (next >= 80) setUploadStatus('Finalizing...');
          return next;
       });
    }, 150);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const result = reader.result as string;
        clearInterval(interval);
        setUploadProgress(100);
        setUploadStatus('Ready');
        
        setTimeout(() => {
            setVideos(prev => [...prev, result]);
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
        }, 400);
    };
  };

  const onTrimVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    const dur = vid.duration;
    if (trimmingSession) {
      setTrimmingSession({
        ...trimmingSession,
        duration: dur,
        endTime: dur
      });
    }
  };

  const handleTrimTimeUpdate = () => {
    if (trimVideoRef.current && trimmingSession) {
      const current = trimVideoRef.current.currentTime;
      if (current >= trimmingSession.endTime) {
        trimVideoRef.current.pause();
        trimVideoRef.current.currentTime = trimmingSession.startTime;
        setTrimmingSession(prev => prev ? { ...prev, isPlaying: false } : null);
      }
    }
  };

  const toggleTrimPlay = () => {
    if (trimVideoRef.current && trimmingSession) {
      if (trimmingSession.isPlaying) {
        trimVideoRef.current.pause();
      } else {
        if (trimVideoRef.current.currentTime >= trimmingSession.endTime) {
           trimVideoRef.current.currentTime = trimmingSession.startTime;
        }
        trimVideoRef.current.play();
      }
      setTrimmingSession({ ...trimmingSession, isPlaying: !trimmingSession.isPlaying });
    }
  };

  const updateTrimStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (trimmingSession && val < trimmingSession.endTime) {
      setTrimmingSession({ ...trimmingSession, startTime: val });
      if (trimVideoRef.current) trimVideoRef.current.currentTime = val;
    }
  };

  const updateTrimEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (trimmingSession && val > trimmingSession.startTime) {
      setTrimmingSession({ ...trimmingSession, endTime: val });
    }
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const confirmTrim = () => {
    if (trimmingSession) {
      finishVideoProcessing(trimmingSession.file, trimmingSession.url);
      setTrimmingSession(null);
    }
  };

  const cancelTrim = () => {
    if (trimmingSession) {
      URL.revokeObjectURL(trimmingSession.url);
      setTrimmingSession(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    const fee = isUrgent ? BOOST_FEE : 0;
    const draftJob: Job = {
       id: `draft_${Math.random().toString(36).substr(2, 9)}`,
       title: aiResult?.title || (category ? `${category} Project` : 'Untitled Draft'),
       description: description,
       budgetRange: aiResult?.budget || 'TBD',
       status: JobStatus.DRAFT,
       images: images,
       postedDate: 'Saved Draft',
       location: 'My Home',
       isUrgent,
       boostFee: fee,
       scopeOfWork: aiResult?.scope || [],
       materialsList: aiResult?.materials || [],
       category: category as any,
       subcategory: subCategory
    } as any;

    onJobPosted(draftJob);
  };

  const runEstimator = async () => {
    if (!description && images.length === 0 && videos.length === 0 && !audioBase64) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStepIndex(0);
    setAiResult(null);

    // Simulate progress steps for UX
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      if (progress > 95) progress = 95; // Hold at 95 until data returns
      
      setAnalysisProgress(progress);
      
      // Update step based on progress
      const step = Math.min(Math.floor((progress / 95) * ANALYSIS_STEPS.length), ANALYSIS_STEPS.length - 1);
      setCurrentStepIndex(step);
    }, 150);

    try {
      const base64Imgs = images.map(img => img.split(',')[1]);
      const base64Vids = videos.map(v => v.split(',')[1]);
      const vidMimeTypes = videos.map(v => v.split(';')[0].split(':')[1]);
      
      const context = subCategory ? `${subCategory} - ${description}` : description;
      
      const result = await analyzeJobMultimodal(
        base64Imgs, 
        context, 
        audioBase64 || undefined,
        base64Vids,
        vidMimeTypes,
        category || undefined
      );
      
      clearInterval(interval);
      setAnalysisProgress(100);
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1);
      
      // Ensure arrays exist
      if (!result.scope) result.scope = [];
      if (!result.materials) result.materials = [];
      
      // Small delay to show 100% complete before switching views
      setTimeout(() => {
        setAiResult(result);
        setIsAnalyzing(false);
      }, 800);
      
    } catch (err) { 
      console.error(err);
      setIsAnalyzing(false);
      clearInterval(interval);
    } 
  };

  const BOOST_FEE = 29.00;

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fadeIn">
      <div className="mb-8 text-center">
         <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Post a Project</h1>
         <p className="text-slate-500 font-medium mt-2 text-lg">Define scope, get an AI analysis, and hire a pro.</p>
      </div>

      <div className="space-y-8">
         {/* Step 1: Category */}
         <div className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-white/5 space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">1</span>
               Trade Category
            </h2>
            <div className="grid grid-cols-3 gap-3">
               {SERVICES.map(s => (
                  <button 
                     key={s.label}
                     onClick={() => { setCategory(s.label); setSubCategory(''); }}
                     className={`flex flex-col items-center justify-center py-5 px-2 rounded-2xl border transition-all gap-3 group ${category === s.label ? 'border-brand-primary bg-brand-surface dark:bg-brand-primary/20 shadow-lg ring-1 ring-brand-primary' : 'border-slate-100 dark:border-white/5 hover:border-brand-accent bg-slate-50 dark:bg-white/5'}`}
                  >
                     <s.icon size={26} className={category === s.label ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-accent transition-colors'} />
                     <span className={`text-[11px] font-bold uppercase leading-none ${category === s.label ? 'text-brand-secondary dark:text-white' : 'text-slate-500'}`}>{s.label}</span>
                  </button>
               ))}
            </div>

            {category && SUB_TASKS[category] && (
               <div className="pt-4 border-t border-slate-100 dark:border-white/5 animate-slideUp">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Specific Task (Optional)</h3>
                  <div className="flex flex-wrap gap-2">
                     {SUB_TASKS[category].map(task => (
                        <button
                           key={task}
                           onClick={() => setSubCategory(task)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${subCategory === task ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-brand-primary'}`}
                        >
                           {task}
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Step 2: Description */}
         <div className="glass-panel p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-white/5 space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">2</span>
               Project Scope
            </h2>
            <textarea 
               value={description}
               onChange={e => setDescription(e.target.value)}
               placeholder="Describe what's wrong or what you need built..."
               className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-5 h-40 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-sm font-medium transition-all"
            />
            
            {uploadError && (
               <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-fadeIn">
                  <div className="flex items-center gap-2">
                     <AlertCircle size={16} className="shrink-0" />
                     <span>{uploadError}</span>
                  </div>
                  <button onClick={() => setUploadError(null)}><X size={14}/></button>
               </div>
            )}

            {/* Media Preview Strip */}
            {(images.length > 0 || videos.length > 0 || isUploading || audioUrl || isRecording) && (
               <div className="space-y-2 animate-fadeIn">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attached Media</h3>
                  <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                      {images.map((img, i) => (
                        <div key={`img-${i}`} className="h-24 w-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative group cursor-pointer" onClick={() => setPreviewMedia({url: img, type: 'image'})}>
                            <img src={img} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                                className="p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-colors shadow-lg"
                              >
                                  <Trash2 size={14} />
                              </button>
                              <div className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white">
                                <Maximize2 size={14} />
                              </div>
                            </div>
                        </div>
                      ))}
                      
                      {videos.map((vid, i) => (
                        <div key={`vid-${i}`} className="relative h-24 w-24 shrink-0 group">
                           <VideoPlayer 
                              src={vid} 
                              onRemove={() => removeVideo(i)} 
                              className="h-full w-full rounded-2xl border border-slate-200 dark:border-white/10" 
                           />
                           <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewMedia({url: vid, type: 'video'}); }}
                              className="absolute top-1 left-1 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20"
                              title="Expand Preview"
                           >
                              <Maximize2 size={12} />
                           </button>
                        </div>
                      ))}

                      {/* Audio Recorder State */}
                      {isRecording && (
                         <div className="h-24 w-32 shrink-0 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 flex flex-col items-center justify-center animate-pulse gap-2">
                            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white animate-pulse">
                               <Mic size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Recording...</span>
                            <button onClick={stopRecording} className="px-3 py-1 bg-white dark:bg-rose-900 text-rose-600 dark:text-rose-200 rounded-lg text-[9px] font-black uppercase shadow-sm">Stop</button>
                         </div>
                      )}

                      {/* Recorded Audio Preview */}
                      {audioUrl && !isRecording && (
                         <div className="h-24 w-32 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 relative group">
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                               <Mic size={16} />
                            </div>
                            <audio src={audioUrl} controls className="w-28 h-6" />
                            <button 
                                onClick={removeAudio}
                                className="absolute top-1 right-1 p-1 bg-rose-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <X size={12} />
                            </button>
                         </div>
                      )}

                      {isUploading && (
                        <div className="h-24 w-32 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center animate-pulse gap-2 p-3 shadow-inner">
                           <Loader2 size={20} className="text-brand-primary animate-spin" />
                           <div className="w-full space-y-1">
                              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                 <span>Uploading</span>
                                 <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-brand-primary transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                           </div>
                           <span className="text-[9px] font-bold text-slate-500 text-center leading-tight truncate w-full">{uploadStatus}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           disabled={isUploading}
                           className="h-11 w-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all gap-1 disabled:opacity-50"
                         >
                            <Camera size={14} />
                            <span className="text-[9px] font-bold uppercase">Img</span>
                         </button>
                         <button 
                           onClick={() => videoInputRef.current?.click()}
                           disabled={isUploading}
                           className="h-11 w-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all gap-1 disabled:opacity-50"
                         >
                            <Video size={14} />
                            <span className="text-[9px] font-bold uppercase">Vid</span>
                         </button>
                      </div>
                  </div>
               </div>
            )}

            <div className="flex gap-4">
               {images.length === 0 && videos.length === 0 && !audioUrl && !isRecording && !isUploading && (
                 <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-brand-primary transition-all group min-w-[120px]"
                   >
                      <Camera size={20} className="group-hover:text-brand-primary transition-colors"/> 
                      Photos
                      <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleImageUpload} />
                   </button>
                   <button 
                      onClick={() => videoInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-brand-primary transition-all group min-w-[120px]"
                   >
                      <Video size={20} className="group-hover:text-brand-primary transition-colors"/> 
                      Video Clip
                      <input ref={videoInputRef} type="file" hidden accept="video/*" capture="environment" onChange={handleVideoUpload} />
                   </button>
                   <button 
                      onClick={startRecording}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-brand-primary transition-all group min-w-[120px]"
                   >
                      <Mic size={20} className="group-hover:text-brand-primary transition-colors"/> 
                      Record Audio
                   </button>
                 </div>
               )}
               
               {/* Hidden inputs to support adding more if strip is visible */}
               <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleImageUpload} />
               <input ref={videoInputRef} type="file" hidden accept="video/*" capture="environment" onChange={handleVideoUpload} />

               {(images.length > 0 || videos.length > 0 || audioUrl) && (
                  <button 
                     onClick={() => setIsUrgent(!isUrgent)}
                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2 ${isUrgent ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-900/20 dark:border-rose-500 dark:text-rose-400 shadow-lg shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-transparent hover:border-slate-300'}`}
                  >
                     {isUrgent ? <Rocket size={20} className="animate-pulse"/> : <AlertCircle size={20}/>} 
                     {isUrgent ? 'Urgent Boost Active' : 'Standard Priority'}
                  </button>
               )}
            </div>
         </div>

         {/* Pricing Summary if Urgent */}
         {isUrgent && (
            <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl flex justify-between items-center animate-fadeIn">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-500/30"><Rocket size={18} /></div>
                  <div>
                     <div className="font-bold text-rose-600 dark:text-rose-400">Priority Boost Active</div>
                     <div className="text-xs text-rose-600/70 dark:text-rose-400/70">Notifications sent to Elite Pros instantly.</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="font-black text-xl text-rose-600 dark:text-rose-400">+${BOOST_FEE.toFixed(2)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Fee</div>
               </div>
            </div>
         )}

         {/* Results / Submit */}
         {!aiResult ? (
            isAnalyzing ? (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-lg animate-fadeIn max-w-lg mx-auto">
                 {/* Progress Header */}
                 <div className="flex flex-col items-center mb-8">
                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                       <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                       <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                          <circle 
                            cx="50" cy="50" r="46" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            strokeDasharray="289" 
                            strokeDashoffset={289 - (289 * analysisProgress / 100)} 
                            className="text-brand-primary transition-all duration-300 ease-linear"
                          />
                       </svg>
                       <div className="font-black text-2xl text-slate-900 dark:text-white flex items-center">{analysisProgress}<span className="text-xs align-top mt-1">%</span></div>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2">Analyzing Project</h3>
                    <p className="text-slate-500 text-sm font-medium">Gemini AI is processing your request</p>
                 </div>

                 {/* Steps Checklist */}
                 <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                   {ANALYSIS_STEPS.map((step, i) => {
                      const isActive = i === currentStepIndex;
                      const isCompleted = i < currentStepIndex;
                      return (
                        <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : isActive ? 'border-brand-primary text-brand-primary scale-110' : 'border-slate-300 dark:border-slate-600'}`}>
                              {isCompleted ? <Check size={14} strokeWidth={3} /> : isActive ? <Loader2 size={14} className="animate-spin"/> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                           </div>
                           <span className={`text-sm font-bold ${isActive ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'} ${isActive ? 'animate-pulse' : ''}`}>{step}</span>
                        </div>
                      )
                   })}
                 </div>
              </div>
            ) : (
              <div className="flex gap-4">
                 <button 
                    onClick={handleSaveDraft}
                    disabled={!description && images.length === 0 && videos.length === 0}
                    className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                 >
                    <Save size={24} className="group-hover:scale-110 transition-transform"/> Save Draft
                 </button>
                 <button 
                    onClick={runEstimator}
                    disabled={(!images.length && !description && !videos.length && !audioBase64) || isUploading || isRecording}
                    className="flex-[2] py-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-[2rem] font-black shadow-2xl shadow-brand-primary/40 hover:scale-[1.02] hover:shadow-brand-primary/60 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                 >
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform"/> Analyze Scope & Estimate
                 </button>
              </div>
            )
         ) : (
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl animate-slideUp border border-slate-800">
               {/* Decorative receipt edge top */}
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-purple-500 to-emerald-500"></div>
               
               <div className="p-10 space-y-8">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                           <BrainCircuit size={18} />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Analysis Complete</span>
                        </div>
                        <div className="group relative">
                           <input 
                              value={aiResult.title}
                              onChange={(e) => setAiResult({ ...aiResult, title: e.target.value })}
                              className="font-black text-3xl tracking-tight bg-transparent border-b border-transparent focus:border-white/30 outline-none w-full text-white placeholder-white/30"
                              placeholder="Project Title"
                           />
                           <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
                        </div>
                        {subCategory && <div className="text-slate-400 font-bold mt-1 text-sm">{category} • {subCategory}</div>}
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Budget</div>
                        <input 
                           value={aiResult.budget}
                           onChange={(e) => setAiResult({ ...aiResult, budget: e.target.value })}
                           className="text-3xl font-black text-white bg-transparent border-b border-transparent focus:border-white/30 outline-none text-right w-32 placeholder-white/30"
                           placeholder="$0"
                        />
                     </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
                     {/* Editable Scope */}
                     <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                           <ScanLine size={14} /> Scope of Work
                        </div>
                        <ul className="space-y-2">
                           {aiResult.scope.map((s: string, i: number) => (
                              <li key={i} className="flex gap-3 items-center group">
                                 <div className="mt-0.5 bg-brand-primary/20 p-1 rounded-full border border-brand-primary/30 shrink-0">
                                    <CheckCircle size={10} className="text-brand-primary" />
                                 </div>
                                 <input
                                    value={s}
                                    onChange={(e) => {
                                       const newScope = [...aiResult.scope];
                                       newScope[i] = e.target.value;
                                       setAiResult({ ...aiResult, scope: newScope });
                                    }}
                                    className="flex-1 bg-transparent text-sm font-medium text-slate-200 border-b border-transparent focus:border-brand-primary/50 outline-none transition-colors py-1 placeholder-slate-600"
                                    placeholder="Scope item description..."
                                 />
                                 <button 
                                    onClick={() => {
                                       const newScope = aiResult.scope.filter((_:any, idx:number) => idx !== i);
                                       setAiResult({ ...aiResult, scope: newScope });
                                    }}
                                    className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                 >
                                    <X size={14} />
                                 </button>
                              </li>
                           ))}
                           <button 
                              onClick={() => setAiResult({ ...aiResult, scope: [...aiResult.scope, ""] })}
                              className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:text-white flex items-center gap-1 mt-2 pl-7 transition-colors"
                           >
                              <Plus size={12} /> Add Scope Item
                           </button>
                        </ul>
                     </div>

                     {/* Editable Materials */}
                     <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-3 pt-4">
                           <Package size={14} /> Required Materials
                        </div>
                        <ul className="space-y-2">
                           {aiResult.materials?.map((m: string, i: number) => (
                              <li key={i} className="flex gap-3 items-center group">
                                 <div className="mt-0.5 bg-indigo-500/20 p-1 rounded-full border border-indigo-500/30 shrink-0">
                                    <Package size={10} className="text-indigo-400" />
                                 </div>
                                 <input
                                    value={m}
                                    onChange={(e) => {
                                       const newMats = [...(aiResult.materials || [])];
                                       newMats[i] = e.target.value;
                                       setAiResult({ ...aiResult, materials: newMats });
                                    }}
                                    className="flex-1 bg-transparent text-sm font-medium text-slate-200 border-b border-transparent focus:border-indigo-500/50 outline-none transition-colors py-1 placeholder-slate-600"
                                    placeholder="Material name and quantity..."
                                 />
                                 <button 
                                    onClick={() => {
                                       const newMats = aiResult.materials.filter((_:any, idx:number) => idx !== i);
                                       setAiResult({ ...aiResult, materials: newMats });
                                    }}
                                    className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                 >
                                    <X size={14} />
                                 </button>
                              </li>
                           ))}
                           <button 
                              onClick={() => setAiResult({ ...aiResult, materials: [...(aiResult.materials || []), ""] })}
                              className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-1 mt-2 pl-7 transition-colors"
                           >
                              <Plus size={12} /> Add Material
                           </button>
                        </ul>
                     </div>
                  </div>
                  
                  {isUrgent && (
                     <div className="flex justify-between items-center py-4 border-t border-white/10 border-dashed">
                        <span className="font-bold text-rose-400 uppercase tracking-widest text-xs">Urgent Boost Fee</span>
                        <span className="font-black text-xl">${BOOST_FEE.toFixed(2)}</span>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Complexity</div>
                        <div className="flex gap-1.5">
                           {[...Array(10)].map((_, i) => (
                              <div key={i} className={`h-2 w-full rounded-full ${i < aiResult.complexity ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                           ))}
                        </div>
                     </div>
                     <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Time</div>
                        <div className="text-lg font-bold text-white">{aiResult.duration || '2-4 Days'}</div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                        onClick={handleSaveDraft}
                        className="flex-1 py-5 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                     >
                        <Save size={20} /> Save Draft
                     </button>
                     <button 
                        onClick={() => {
                           const fee = isUrgent ? BOOST_FEE : 0;
                           alert(`Project Published! Total Fee: $${fee.toFixed(2)}`);
                           onJobPosted({
                              id: `job_${Math.random()}`,
                              title: aiResult.title,
                              description: description,
                              budgetRange: aiResult.budget,
                              status: JobStatus.OPEN,
                              images: images,
                              postedDate: 'Just Now',
                              location: 'My Home',
                              isUrgent,
                              boostFee: fee,
                              scopeOfWork: aiResult.scope,
                              materialsList: aiResult.materials
                           } as any);
                        }}
                        className="flex-[2] py-5 bg-white text-slate-900 rounded-2xl font-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 uppercase tracking-wide text-sm group"
                     >
                        Confirm & Publish <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                     </button>
                  </div>
                  <button onClick={() => setAiResult(null)} className="w-full text-xs text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Discard & Restart</button>
               </div>
            </div>
         )}
      </div>

      {previewMedia && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" onClick={() => setPreviewMedia(null)}>
           <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X size={32}/>
           </button>
           <div className="max-w-5xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
              {previewMedia.type === 'video' ? (
                 <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
              ) : (
                 <img src={previewMedia.url} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
              )}
           </div>
        </div>
      )}

      {trimmingSession && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
           <button onClick={cancelTrim} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20">
              <X size={24}/>
           </button>
           
           <div className="w-full max-w-4xl flex flex-col gap-6 relative">
              <div className="flex items-center gap-3 text-white mb-2">
                 <Scissors size={24} className="text-brand-primary"/>
                 <h2 className="text-xl font-bold">Trim Video Clip</h2>
              </div>

              <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 aspect-video">
                 <video 
                    ref={trimVideoRef}
                    src={trimmingSession.url} 
                    className="w-full h-full object-contain"
                    onLoadedMetadata={onTrimVideoLoaded}
                    onTimeUpdate={handleTrimTimeUpdate}
                    onClick={toggleTrimPlay}
                 />
                 {/* Play Overlay */}
                 {!trimmingSession.isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-xl">
                          <Play size={32} className="text-white fill-white ml-1"/>
                       </div>
                    </div>
                 )}
              </div>

              {/* Timeline Controls */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
                 <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{formatTime(trimmingSession.startTime)}</span>
                    <span>Duration: {formatTime(trimmingSession.endTime - trimmingSession.startTime)}</span>
                    <span>{formatTime(trimmingSession.endTime)}</span>
                 </div>

                 <div className="relative h-12 flex items-center select-none" ref={timelineRef}>
                    {/* Track */}
                    <div className="absolute inset-x-0 h-2 bg-slate-700 rounded-full overflow-hidden">
                       <div 
                          className="absolute h-full bg-brand-primary"
                          style={{
                             left: `${(trimmingSession.startTime / trimmingSession.duration) * 100}%`,
                             right: `${100 - (trimmingSession.endTime / trimmingSession.duration) * 100}%`
                          }}
                       ></div>
                    </div>

                    {/* Inputs */}
                    <input 
                       type="range" 
                       min={0} 
                       max={trimmingSession.duration} 
                       step={0.1}
                       value={trimmingSession.startTime}
                       onChange={updateTrimStart}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <input 
                       type="range" 
                       min={0} 
                       max={trimmingSession.duration} 
                       step={0.1}
                       value={trimmingSession.endTime}
                       onChange={updateTrimEnd}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {/* Visual Handles */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded shadow-lg pointer-events-none flex flex-col items-center justify-center"
                        style={{ left: `${(trimmingSession.startTime / trimmingSession.duration) * 100}%` }}
                    >
                       <div className="w-4 h-4 bg-brand-primary rounded-full -mt-6 border-2 border-white"></div>
                    </div>
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded shadow-lg pointer-events-none flex flex-col items-center justify-center"
                        style={{ left: `${(trimmingSession.endTime / trimmingSession.duration) * 100}%` }}
                    >
                       <div className="w-4 h-4 bg-brand-primary rounded-full -mt-6 border-2 border-white"></div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-2">
                    <button onClick={toggleTrimPlay} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                       {trimmingSession.isPlaying ? <Pause size={18}/> : <Play size={18}/>} Preview
                    </button>
                    <button onClick={confirmTrim} className="flex-[2] py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
                       <Film size={18}/> Trim & Attach
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default JobPoster;
