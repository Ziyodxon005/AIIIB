import React, { useEffect, useState } from 'react';

/**
 * SourceToast
 * Props:
 *   source  – { url, title, id } object or null
 *   onClose – callback to clear the source from parent state
 */
const SourceToast = ({ source, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!source) {
            setVisible(false);
            return;
        }

        setVisible(true);
        setProgress(100);

        // Countdown progress bar over 20 seconds
        const startTime = Date.now();
        const duration = 20000;
        const tick = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
        }, 50);

        // Auto-dismiss after 20 s
        const timer = setTimeout(() => {
            setVisible(false);
            clearInterval(tick);
            setTimeout(onClose, 350); // wait for fade-out animation
        }, duration);

        return () => {
            clearTimeout(timer);
            clearInterval(tick);
        };
    }, [source?.id]); // re-run only when a NEW source arrives

    if (!source) return null;

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 350);
    };

    // Shorten title for display
    const displayTitle = source.title && source.title !== source.url
        ? source.title
        : (source.url.replace(/^https?:\/\//, '').split('/')[0]);

    return (
        <div className={`source-toast ${visible ? 'source-toast--visible' : 'source-toast--hidden'}`}>
            <div className="source-toast__icon">🔗</div>
            <div className="source-toast__body">
                <span className="source-toast__label">Manba</span>
                <a
                    className="source-toast__link"
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={source.url}
                >
                    {displayTitle}
                </a>
            </div>
            <button className="source-toast__close" onClick={handleClose} aria-label="Yopish">✕</button>
            <div
                className="source-toast__progress"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default SourceToast;
