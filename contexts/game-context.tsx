import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameContextType {
  currentScore: { correct: number; total: number };
  setCurrentScore: (score: { correct: number; total: number }) => void;
  hasShownHighScoreNotification: boolean;
  setHasShownHighScoreNotification: (shown: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentScore, setCurrentScore] = useState({ correct: 0, total: 0 });
  const [hasShownHighScoreNotification, setHasShownHighScoreNotification] = useState(false);

  const value = {
    currentScore,
    setCurrentScore,
    hasShownHighScoreNotification,
    setHasShownHighScoreNotification,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};