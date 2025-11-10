import { useState, useRef, useEffect } from 'react';

export default function LoginVideoSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    "/assets/videos/Vidéo_promo_1.mp4",
    "/assets/videos/Vidéo_promo_2.mp4",
    "/assets/videos/Vidéo_promo_3.mp4"
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    video.addEventListener('ended', handleVideoEnd);
    return () => video.removeEventListener('ended', handleVideoEnd);
  }, [videos.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {
        // Ignorer les erreurs de lecture automatique
      });
    }
  }, [currentVideoIndex]);

  return (
    <div className="hidden lg:flex lg:w-[60%] h-full relative bg-fp-accent overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-fp-accent via-indigo-600 to-purple-600" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        style={{ zIndex: 1 }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }} />
    </div>
  );
}
