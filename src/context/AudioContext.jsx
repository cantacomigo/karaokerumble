import { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    // Inicializa o elemento de áudio (invisível)
    useEffect(() => {
        audioRef.current = new Audio();

        // Listeners de eventos de áudio
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    const playTrack = (track) => {
        if (!audioRef.current) return;

        // Se for a mesma música que já está no player
        if (currentTrack?.id === track.id) {
            if (track.video_url) {
                setIsPlaying(!isPlaying); // Para vídeo, apenas alternamos o estado visual/controle
                return;
            }

            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        // Se for uma música nova
        setCurrentTrack(track);

        // Se for VÍDEO (Rumble)
        if (track.video_url) {
            audioRef.current.pause(); // Para qualquer áudio anterior
            audioRef.current.src = "";
            setIsPlaying(true);
            return;
        }

        // Se for ÁUDIO normal
        audioRef.current.src = track.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(error => {
            console.error("Erro ao reproduzir o áudio:", error);
            setIsPlaying(false);
        });
    };

    const pauseTrack = () => {
        if (audioRef.current && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const seekTrack = (percentage) => {
        if (audioRef.current && duration) {
            const seekTime = (percentage / 100) * duration;
            audioRef.current.currentTime = seekTime;
            setProgress(percentage);
        }
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            progress,
            currentTime: audioRef.current ? formatTime(audioRef.current.currentTime) : "00:00",
            totalTime: formatTime(duration),
            playTrack,
            pauseTrack,
            seekTrack,
            isVideo: !!currentTrack?.video_url
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio deve ser usado dentro de um AudioProvider');
    }
    return context;
}
