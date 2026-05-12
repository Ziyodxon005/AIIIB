import React from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';

// General uchun statik rasm
const GENERAL_IMAGE = '/general.jpg';

const HologramStage = ({
    currentPersonaId,
    volume,
    isLive,
    isVisionEnabled,
    videoRef,
    personaName,
    personaState = 'idle'
}) => {

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
                {/* General Rasm */}
                <motion.div
                    className="character-video-container"
                    animate={{ scale: 1 + volume * 0.15 }}
                    transition={{ duration: 0.1 }}
                    style={{ position: 'relative' }}
                >
                    <img
                        src={GENERAL_IMAGE}
                        alt="General"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transition: 'filter 0.5s ease-in-out',
                            filter: isLive ? 'none' : 'grayscale(30%) brightness(0.8)',
                            borderRadius: 'inherit',
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
