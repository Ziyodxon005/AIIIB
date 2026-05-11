import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import ConversationPage from './components/ConversationPage';
import './App.css';

// Avtomatik general personajini ishlatamiz - persona tanlash sahifasi yo'q
const AUTO_PERSONA_ID = 'general';

function App() {
    const [currentPage, setCurrentPage] = useState('splash');

    const handleSplashComplete = () => {
        // Splash tugagach to'g'ridan-to'g'ri conversation sahifasiga o'tamiz
        setCurrentPage('conversation');
    };

    const handleBack = () => {
        // Orqaga bosganda splash sahifasiga qaytamiz (yoki shu sahifada qolamiz)
        setCurrentPage('splash');
    };

    return (
        <div className="app">
            <AnimatePresence mode="wait">
                {currentPage === 'splash' ? (
                    <SplashScreen
                        key="splash"
                        onComplete={handleSplashComplete}
                    />
                ) : (
                    <ConversationPage
                        key="conversation"
                        personaId={AUTO_PERSONA_ID}
                        onBack={handleBack}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
