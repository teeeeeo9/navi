import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'goal' | 'milestone';
}

// Success emoji explosion component
const EmojiParticle = ({ index, emoji }: { index: number, emoji: string }) => {
  const randomX = Math.random() * 200 - 100; // -100 to 100
  const randomY = Math.random() * 200 - 100; // -100 to 100
  const randomRotation = Math.random() * 720; // 0 to 720 degrees
  const randomScale = Math.random() * 0.8 + 0.6; // 0.6 to 1.4
  const randomDuration = 1.5 + Math.random() * 1; // 1.5 to 2.5 seconds
  
  return (
    <motion.div
      className="absolute text-2xl select-none pointer-events-none"
      initial={{
        x: 0,
        y: 0,
        opacity: 1,
        scale: 0,
        rotate: 0,
      }}
      animate={{
        x: randomX,
        y: randomY,
        opacity: 0,
        scale: randomScale,
        rotate: randomRotation,
      }}
      transition={{
        duration: randomDuration,
        ease: "easeOut",
        delay: index * 0.03,
      }}
    >
      {emoji}
    </motion.div>
  );
};

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({ 
  isVisible, 
  onComplete, 
  type = 'goal' 
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setShowCelebration(true);
      
      // Auto-hide after animation completes
      const timeout = setTimeout(() => {
        setShowCelebration(false);
        onComplete?.();
      }, 2500);
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onComplete]);
  
  // Success emojis for celebration
  const successEmojis = [
    '🎉', '🥳', '👍', '👏', '🚀', '⭐', '💪', '🔥', 
    '🎯', '🏆', '✨', '🌟', '💯', '🙌', '👌', '🎊',
    '🎈', '🌈', '💫', '⚡', '🎪', '🎭', '🎨', '🎵',
    '🎶', '🎸', '🥇', '🏅', '💎', '👑', '🦄', '🌺'
  ];
  
  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Position the explosion closer to center-right where progress controls typically are */}
          <div 
            className="absolute"
            style={{ 
              top: '45%', 
              left: '65%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Emoji explosion burst */}
            <div className="relative">
              {Array.from({ length: 25 }).map((_, index) => (
                <EmojiParticle
                  key={`emoji-${index}`}
                  index={index}
                  emoji={successEmojis[index % successEmojis.length]}
                />
              ))}
            </div>
            
            {/* Central burst effect */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 0], 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 1, 
                ease: "easeOut",
                delay: 0.1 
              }}
            >
              <div className="text-4xl">
                {type === 'goal' ? '🏆' : '🎯'}
              </div>
            </motion.div>
            
            {/* Pulsing ring effect */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-yellow-400 rounded-full"
              style={{ width: 100, height: 100 }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ 
                scale: [0, 1.5, 2.5], 
                opacity: [0.8, 0.4, 0] 
              }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.1 
              }}
            />
            
            {/* Second smaller ring */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-orange-400 rounded-full"
              style={{ width: 60, height: 60 }}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ 
                scale: [0, 1.2, 2], 
                opacity: [0.6, 0.3, 0] 
              }}
              transition={{ 
                duration: 1, 
                ease: "easeOut",
                delay: 0.2 
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationAnimation; 