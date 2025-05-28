import React from 'react';
import { motion } from 'framer-motion';
import { Goal } from '@/services/api';
import theme from '@/styles/theme';

// Unified Progress Bar Component for Zen Mode
const ZenProgressBar = ({ progress }: { progress: number }) => {
  const progressPercentage = (progress / 10) * 100;
  
  const getColorForProgress = (progress: number) => {
    if (progress <= 2) return theme.blue[900];
    if (progress <= 4) return theme.blue[500];
    if (progress <= 6) return theme.grey[500];
    if (progress <= 9) return theme.blue[500];
    return theme.orange[500]; // Using lighter orange
  }
  
  const progressColor = getColorForProgress(progress);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: progressColor
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Milestone Progress Bar for Zen Mode - now using same component
const ZenMilestoneProgress = ({ progress, title }: { progress: number, title: string }) => {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-4">
        <span className="text-white/90 text-base font-medium">{title}</span>
      </div>
      <ZenProgressBar progress={progress} />
    </motion.div>
  );
};

interface ZenModeProps {
  goal: Goal;
  onExitZen: () => void;
}

const ZenMode: React.FC<ZenModeProps> = ({ goal, onExitZen }) => {
  const progressValue = Math.round(goal.completion_status / 10);
  
  // Get the "why it's important" reflection from the record
  const importanceReflection = goal.reflections?.['importance'];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-dark-900/80 to-dark-800/80 flex items-center justify-center">
      {/* Background elements for glass effect - more transparent */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full blur-[120px]" 
          style={{ backgroundColor: 'rgba(113, 160, 198, 0.05)' }}
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute top-[40%] -right-[5%] h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ backgroundColor: 'rgba(122, 144, 161, 0.05)' }}
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-[10%] left-[30%] h-[250px] w-[250px] rounded-full blur-[80px]"
          style={{ backgroundColor: 'rgba(247, 144, 81, 0.05)' }}
          animate={{
            x: [0, 10, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Zen Mode Exit Button */}
      <button
        onClick={onExitZen}
        className="fixed top-6 right-6 z-60 rounded-full border border-orange-400/30 bg-orange-500/15 px-5 py-2 text-sm font-medium text-orange-300 backdrop-blur-sm transition-colors hover:bg-orange-500/25"
      >
        Zen Mode
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-8">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Subtle Glow Animation */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `radial-gradient(circle at center, ${theme.orange[500]}15 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Content Container */}
          <motion.div 
            className="relative bg-white/3 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Goal Title */}
            <motion.h1
              className="text-4xl md:text-5xl font-medium text-white mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {goal.title}
            </motion.h1>

            {/* Main Progress Bar */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <ZenProgressBar progress={progressValue} />
            </motion.div>

            {/* Why It's Important */}
            {importanceReflection && (
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
                  {importanceReflection.content}
                </p>
              </motion.div>
            )}

            {/* Milestones */}
            {goal.milestones && goal.milestones.length > 0 && (
              <motion.div
                className="space-y-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                {goal.milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + (index * 0.1), duration: 0.6 }}
                  >
                    <ZenMilestoneProgress
                      progress={Math.round(milestone.completion_status / 10)}
                      title={milestone.title}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ZenMode; 