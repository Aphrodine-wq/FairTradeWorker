
import React, { useRef, useState } from 'react';
import { Play, Pause, Trash2, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onRemove?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onRemove, className = "h-24 w-24" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(p);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  return (
    <div className={`relative shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-black group ${className}`}>
        <video 
            ref={videoRef}
            src={src} 
            className="h-full w-full object-cover" 
            playsInline 
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onClick={togglePlay}
        />
        
        {/* Play/Pause Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            <div className="bg-black/40 backdrop-blur-sm p-2 rounded-full border border-white/20 shadow-lg">
                {isPlaying ? <Pause size={16} className="text-white fill-white" /> : <Play size={16} className="text-white fill-white ml-0.5" />}
            </div>
        </div>

        {/* Progress Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 pointer-events-none">
            <div className="h-full bg-brand-primary transition-all duration-100" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onRemove && (
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-colors shadow-sm">
                    <Trash2 size={12} />
                </button>
            )}
        </div>
        
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors shadow-sm border border-white/10">
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
        </div>
    </div>
  );
};
