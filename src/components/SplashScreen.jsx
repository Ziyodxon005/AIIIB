import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 8000); // 8 soniya

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
        >
            <div className="splash-content">
                <motion.img
                    src="/logo.png"
                    alt="Andijon IIB Logo"
                    className="splash-logo"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />

                <motion.h1
                    className="splash-department"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1 }}
                >
                    ANDIJON VILOYATI
                </motion.h1>

                <motion.h2
                    className="splash-department-sub"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 1 }}
                >
                    ICHKI ISHLAR BO'LIMI
                </motion.h2>

                <motion.p
                    className="splash-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8, duration: 1 }}
                >
                    Sun'iy Intellekt Maslahat Tizimi
                </motion.p>

                <motion.div
                    className="splash-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 4, duration: 0.5 }}
                >
                    <div className="splash-loading-bar">
                        <motion.div
                            className="splash-loading-fill"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 4, duration: 4, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
