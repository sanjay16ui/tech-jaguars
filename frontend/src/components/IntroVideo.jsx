import React, { useState, useRef, useEffect } from 'react';
import { Play, SkipForward } from 'lucide-react';

export default function IntroVideo({ onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt autoplay when component mounts
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBlocked(false);
          })
          .catch((error) => {
            // Autoplay was blocked by the browser
            setIsBlocked(true);
            setIsPlaying(false);
            console.log("Autoplay blocked:", error);
          });
      }
    }
  }, []);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Wait for fade out animation
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleError = () => {
    console.error("Video failed to load.");
    onComplete(); // Instantly fallback to the app
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsBlocked(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Manual play failed:", err);
          onComplete(); // Fallback to app if play totally fails
        });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {isBlocked && (
        <div className="absolute z-10 flex flex-col items-center justify-center p-6 text-center text-white space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide">Welcome to BIS Sentinel</h2>
          <p className="text-slate-300 md:text-lg max-w-md">Experience the cinematic intro or head straight to verification.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handlePlayClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center transition shadow-lg shadow-blue-900/50"
            >
              <Play className="w-5 h-5 mr-2" /> Play Intro
            </button>
            <button 
              onClick={handleSkip}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3 rounded-full font-semibold flex items-center justify-center transition"
            >
              Enter BIS Sentinel
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src="/video/intro.mp4"
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isBlocked ? 'opacity-30 blur-sm' : 'opacity-100'}`}
        onEnded={handleFinish}
        onError={handleError}
        playsInline
        // We explicitly don't use 'muted' because the prompt requires: "play the intro video first with its original audio enabled."
      />

      {(!isBlocked) && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-full font-medium flex items-center justify-center transition-all opacity-70 hover:opacity-100 z-20"
        >
          Skip Intro <SkipForward className="w-4 h-4 ml-2" />
        </button>
      )}
    </div>
  );
}
