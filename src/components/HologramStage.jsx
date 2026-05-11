import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';

// General uchun bitta video manba
const GENERAL_VIDEO = '/general.mp4';

const HologramStage = ({
    currentPersonaId,
    volume,
    isLive,
    isVisionEnabled,
    videoRef,
    personaName,
    personaState = 'idle'
}) => {
    const mainVideoRef = useRef(null);

    // Video holati o'zgarganda play/pause
    useEffect(() => {
        const video = mainVideoRef.current;
        if (!video) return;

        if (isLive) {
            video.play().catch(err => console.log('Video autoplay blocked:', err));
        } else {
            video.pause();
        }
    }, [isLive, currentPersonaId]);

    return (
        <motion.div
            className="hologram-container materialize-enter"
            animate={{ y: [0, -15, 0] }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            key={currentPersonaId}
        >
            {/* Scanning Line (Vision Mode) */}
            {isVisionEnabled && <div className="scanning-line" />}

            {/* Character Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                {/* General Video */}
                <motion.div
                    className="character-video-container"
                    animate={{ scale: 1 + volume * 0.15 }}
                    transition={{ duration: 0.1 }}
                    style={{ position: 'relative' }}
                >
                    <video
                        ref={mainVideoRef}
                        src={GENERAL_VIDEO}
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            opacity: 1,
                            transition: 'opacity 0.5s ease-in-out',
                            filter: isLive ? 'none' : 'grayscale(30%) brightness(0.8)',
                        }}
                    />

                    {/* Invisible spacer to maintain container size */}
                    <div style={{ width: '100%', paddingBottom: '100%' }} />
                </motion.div>

                {/* Character Name */}
                <h2 className="gold-calligraphy text-2xl mt-6 text-center">
                    {personaName || 'Andijon IIB Maslahatchisi'}
                </h2>

                {/* Status Text */}
                <p className="text-xs tracking-widest mt-4" style={{ color: isLive ? '#00f3ff' : '#666' }}>
                    {isLive
                        ? (personaState === 'speaking' || personaState === 'greeting'
                            ? 'JAVOB BERILMOQDA'
                            : (isVisionEnabled ? 'KO\'RISH FAOL' : 'ESHITILMOQDA'))
                        : 'ULANMOQDA...'}
                </p>
            </div>

            {/* Audio Visualizer at Base */}
            <div className="visualizer-base">
                <AudioVisualizer volume={volume} isActive={isLive} />
            </div>

            {/* Vision Video Preview */}
            <video
                ref={videoRef}
                className="vision-preview"
                style={{ opacity: isVisionEnabled ? 1 : 0, pointerEvents: isVisionEnabled ? 'auto' : 'none' }}
                muted
            />
        </motion.div>
    );
};

export default HologramStage;
