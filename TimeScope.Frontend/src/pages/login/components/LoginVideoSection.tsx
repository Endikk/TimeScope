import { useState, useRef, useEffect } from 'react';

export default function LoginVideoSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    "/assets/Vidéo_promo_1.mp4",
    "/assets/Vidéo_promo_2.mp4",
    "/assets/Vidéo_promo_3.mp4"
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

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12 text-white w-full">
        <div className="max-w-xl">
          <h1 className="text-6xl font-heading font-bold mb-6 text-white drop-shadow-lg">
            TimeScope
          </h1>
          <p className="text-2xl mb-8 text-white/90 font-body">
            Gérez votre temps efficacement
          </p>
          <div className="space-y-4 text-lg text-white/80 font-body">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-white/70 rounded-full flex-shrink-0" />
              <span>Suivi du temps en temps réel</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-white/70 rounded-full flex-shrink-0" />
              <span>Rapports détaillés et analyses</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-white/70 rounded-full flex-shrink-0" />
              <span>Gestion d'équipe simplifiée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
