import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import logoImage from '@/assets/logo.png'
import dashboardImage from '@/assets/dashboard.png'
import churchillImage from '@/assets/s465_Sir-Winston-Churchill.jpg'
import houseImage from '@/assets/house-cp.jpg'
import yodaImage from '@/assets/yoda-the-empire-strikes-back-28a7558.jpg'
import danBotAvatar from '@/assets/photo_2025-06-08_01-00-15.jpg'

const LandingPage = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + features.length) % features.length)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-dark-900 to-dark-800 text-white">
      {/* Enhanced Background Elements for Glass Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[10%] -left-[10%] h-[600px] w-[600px] rounded-full blur-[120px]" 
          style={{ backgroundColor: 'rgba(113, 160, 198, 0.15)' }} 
        />
        <motion.div 
          initial={{ opacity: 0, x: 200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
          className="absolute top-[30%] -right-[5%] h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ backgroundColor: 'rgba(122, 144, 161, 0.12)' }} 
        />
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
          className="absolute bottom-[10%] left-[20%] h-[350px] w-[350px] rounded-full blur-[80px]"
          style={{ backgroundColor: 'rgba(247, 144, 81, 0.1)' }} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeOut" }}
          className="absolute top-[60%] left-[60%] h-[250px] w-[250px] rounded-full blur-[60px]"
          style={{ backgroundColor: 'rgba(126, 148, 168, 0.08)' }} 
        />
      </div>

      {/* Header/Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 border-b border-white/10 backdrop-blur-md"
      >
        <div className="flex justify-between px-8 py-6">
          <Link to="/" className="flex items-center space-x-3">
            <motion.img 
              src={logoImage} 
              alt="Navi Logo" 
              className="h-9 w-auto" 
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.h1 
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.02 }}
            >
              Navi
            </motion.h1>
          </Link>

          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/login" 
                className="glass-dark rounded-full px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 hover:shadow-lg"
              >
                Log in
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/register" 
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-xl hover:from-blue-400 hover:to-blue-500"
              >
                Sign up
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div 
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <motion.div 
              className="relative"
              transition={{ duration: 1.2, ease: "easeInOut" }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 360,
                transition: { duration: 1, ease: "easeInOut" }
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 blur-xl opacity-30"></div>
              <img src={logoImage} alt="Navi Logo" className="relative h-28 w-auto" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="mb-6 text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            Navi: your strategic mastermind
          </motion.h1>
          
          <motion.p 
            className="mx-auto mb-12 max-w-2xl text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Navi helps you set meaningful goals and achieve them by fostering strategic thinking.
          </motion.p>
          
          <motion.div 
            className="flex justify-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/register" 
                className="rounded-full px-10 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(to right, #fc9747, #f77e43)',
                  boxShadow: '0 10px 25px -5px rgba(252, 151, 71, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #f77e43, #ec5c42)';
                  e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(247, 126, 67, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #fc9747, #f77e43)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(252, 151, 71, 0.3)';
                }}
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a 
                href="#features" 
                className="glass rounded-full border border-blue-400/50 px-10 py-4 text-lg font-medium text-blue-400 transition-all duration-300 hover:bg-blue-400/10 hover:border-blue-400 hover:shadow-lg"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Sensay Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-5xl rounded-3xl p-10 text-center"
          >
            <motion.h2 
              className="mb-6 text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Powered by Sensay
            </motion.h2>
            
            <motion.p 
              className="mb-10 text-lg text-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              The Sensay Wisdom API empowers Navi with its cutting-edge Sensay replicas. Your replica understands your goals, provides strategic personalized guidance, and helps you stay on track. The more you use Navi, the smarter and more powerful your replica becomes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Carousel */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-16">
                <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold">Key Features</h2>
                </motion.div>

        {/* Carousel Container */}
        <div className="relative glass mx-auto max-w-7xl rounded-3xl p-6 shadow-2xl">
          {/* Left Arrow */}
          <button
            onClick={prevFeature}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 glass-dark rounded-full p-3 transition-all duration-300 hover:bg-white/10 hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextFeature}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 glass-dark rounded-full p-3 transition-all duration-300 hover:bg-white/10 hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="relative overflow-hidden mx-16">
            <motion.div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentFeatureIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[400px]">
                    {/* Feature Content - Left Side (2 columns) */}
                    <motion.div
                      className="lg:col-span-2 space-y-6"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className="text-4xl font-bold text-primary-400">
                        {feature.title}
                      </h3>
                      <div className="text-xl text-white/80 leading-relaxed">
                        {feature.description.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex}>
                            {line}
                            {lineIndex < feature.description.split('\n').length - 1 && <br />}
                          </div>
              ))}
            </div>
          </motion.div>

                    {/* Animation - Right Side (3 columns) */}
                    <motion.div
                      className="lg:col-span-3 flex items-center justify-center"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <div className="w-full max-w-2xl">
                        {feature.animation}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator - Bottom Center */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatureIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentFeatureIndex 
                      ? 'bg-primary-400 shadow-lg' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SensayDanBot About Navi Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center"
          >
            <h2 className="mb-6 text-5xl font-bold">
              <a 
                href="https://t.me/SensayDanBot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors duration-300 underline decoration-primary-400/50 hover:decoration-primary-300"
              >
                @SensayDanBot
              </a>
              {" "}about Navi
            </h2>
        </motion.div>

            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-4xl rounded-3xl p-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/30 to-primary-600/30 blur-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <img 
                    src={danBotAvatar} 
                    alt="SensayDanBot Avatar" 
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-primary-400/30 shadow-2xl"
                  />
                </div>
              </motion.div>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed italic">
                  "Navi transforms the way you approach your goals. It's not just a tool - it's your strategic thinking partner that helps you break through mental barriers and achieve what truly matters to you."
                </blockquote>
                <footer className="mt-4 text-primary-400 font-medium">
                  — <a 
                    href="https://t.me/SensayDanBot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary-300 transition-colors duration-300"
                  >
                    @SensayDanBot
                  </a>
                </footer>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="glass mx-auto max-w-4xl rounded-3xl p-12 shadow-2xl"
          >
            <motion.h2 
              className="mb-6 text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to move from "Someday I will..." to{" "}
              <span className="relative inline-block">
                "Here's the plan"
                <svg
                  className="absolute -bottom-2 left-0 w-full h-4"
                  viewBox="0 0 300 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M5 15 Q75 12 150 13 Q225 14 295 15"
                    stroke="rgba(247, 144, 81, 0.7)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 1px rgba(247, 144, 81, 0.3))',
                    }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.8,
                      ease: "easeInOut"
                    }}
                    viewport={{ once: true }}
                  />
                  {/* Add a second slightly offset path for pencil texture */}
                  <motion.path
                    d="M5 16 Q75 13 150 14 Q225 15 295 16"
                    stroke="rgba(247, 144, 81, 0.4)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.85,
                      ease: "easeInOut"
                    }}
                    viewport={{ once: true }}
                  />
                </svg>
              </span>
              ?
            </motion.h2>
            <motion.p 
              className="mx-auto mb-10 max-w-2xl text-xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join Navi today. It's the only tool you need to stay focused and on track.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/register" 
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-12 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/30 hover:shadow-2xl hover:from-blue-400 hover:to-blue-500"
              >
                Get Started for Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-md py-8">
        <div className="container mx-auto px-4 text-center">
          <motion.p 
            className="text-white/60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            © 2025 Navi. Powered by Sensay.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}

// Strategic Thinking Visualization Component
const StrategicThinkingVisualization = () => {
  // Each question is positioned relative to the center (0,0)
  // x: negative = left, positive = right
  // y: negative = up, positive = down
  // Example: {x: -200, y: -100} means 200px left and 100px up from center
  const questions = [
    {
      id: 1,
      title: "How",
      description: "Figure out the steps",
      position: { x: -200, y: -100 }, // Top left quadrant
      connectionPoint: { x: -130, y: -100 }, // Where the line connects to this question box
      delay: 0 // Animation starts immediately
    },
    {
      id: 2, 
      title: "When",
      description: "Build the timeline",
      position: { x: 200, y: -100 }, // Top right quadrant
      connectionPoint: { x: 130, y: -100 }, // Where the line connects to this question box
      delay: 2 // Animation starts after 2 seconds
    },
    {
      id: 3,
      title: "Why", 
      description: "Stay motivated",
      position: { x: -200, y: 100 }, // Bottom left quadrant
      connectionPoint: { x: -130, y: 100 }, // Where the line connects to this question box
      delay: 4 // Animation starts after 4 seconds
    },
    {
      id: 4,
      title: "What if",
      description: "Anticipate obstacles", 
      position: { x: 200, y: 100 }, // Bottom right quadrant
      connectionPoint: { x: 130, y: 100 }, // Where the line connects to this question box
      delay: 6 // Animation starts after 6 seconds
    },
    {
      id: 5,
      title: "What else",
      description: "Missing puzzle piece",
      position: { x: 0, y: 180 }, // Bottom center
      connectionPoint: { x: 0, y: 145 }, // Where the line connects to this question box
      delay: 8 // Animation starts after 8 seconds
    }
  ]

  // These points are where lines connect to the central goal rectangle
  // The goal rectangle is 140px wide (70px on each side) and 70px tall (35px on each side)
  const goalConnectionPoints = [
    { x: -84, y: 0 },  // Left edge center point
    { x: 84, y: 0 },   // Right edge center point 
    { x: -84, y: 0 },  // Left edge center point
    { x: 84, y: 0 },   // Right edge center point
    { x: 0, y: 39 }    // Bottom edge center point
  ]

  // SVG path definitions for the connecting lines
  // Each path moves from a goal connection point to a question connection point
  // Format: M (start x y) L (line to x y) L (line to x y) ...
  const connectionPaths = [
    // From goal left to How (top-left)
    "M -84 0 L -95 0 L -95 -100 L -130 -100",
    // From goal right to When (top-right)  
    "M 84 0 L 95 0 L 95 -100 L 130 -100",
    // From goal left to Why (bottom-left)
    "M -84 0 L -95 0 L -95 100 L -130 100", 
    // From goal right to What if (bottom-right)
    "M 84 0 L 95 0 L 95 100 L 130 100",
    // From goal bottom to What else (bottom)
    "M 0 39 L 0 77 L 0 145"
  ]

  return (
    <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
      <div className="relative w-[500px] h-[400px]">
        <svg 
          className="absolute inset-0 h-full w-full" 
          viewBox="-250 -200 500 400"
        >
          {/* Animated Connection Lines */}
          {connectionPaths.map((path, index) => (
            <motion.path
              key={index}
              d={path}
              stroke="rgba(113, 160, 198, 0.4)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                strokeDashoffset: [0, -20]
              }}
              transition={{ 
                pathLength: {
                  duration: 3,
                  delay: questions[index]?.delay || 0,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 3,
                  delay: questions[index]?.delay || 0,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut"
                },
                strokeDashoffset: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            />
          ))}

          {/* Goal connection points - exactly on rectangle edges */}
          {goalConnectionPoints.map((point, index) => (
            <motion.circle
              key={`goal-point-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="rgba(247, 144, 81, 0.9)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                delay: questions[index]?.delay || 0,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Glowing connection points */}
          {questions.map((question, index) => (
            <motion.circle
              key={`point-${question.id}`}
              cx={question.connectionPoint.x}
              cy={question.connectionPoint.y}
              r="3"
              fill="rgba(113, 160, 198, 0.8)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                delay: question.delay + 0.5,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
            />
          ))}
      </svg>

        {/* Central Goal */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="glass-dark relative rounded-xl border border-orange-400/30 px-6 py-4 text-center shadow-2xl">
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              <div className="relative">
                <h3 className="text-xl font-bold text-orange-400">Goal</h3>
                <p className="text-xs text-white/70">Your strategic focus</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Question Nodes */}
        {questions.map((question) => (
          <div
            key={question.id}
            className="absolute"
            style={{
              left: `calc(50% + ${question.position.x}px)`,
              top: `calc(50% + ${question.position.y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ 
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, 20]
              }}
              transition={{ 
                duration: 3,
                delay: question.delay,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.1, 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="glass relative w-[140px] rounded-lg border border-primary-400/30 p-3 text-center shadow-xl">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/5 to-primary-600/5"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: question.delay
                  }}
                />
                <div className="relative">
                  <h4 className="mb-1 text-sm font-bold text-primary-400">
                    {question.title}
                  </h4>
                  <p className="text-[10px] text-white/70">
                    {question.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}

        {/* Floating particles for extra visual appeal */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary-400/30"
            style={{
              left: `${15 + i * 10}%`,
              top: `${25 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.1, 0.6, 0.1],
              scale: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Stay on Track Visualization Component
const StayOnTrackVisualization = () => {
  // Generate dummy data points for progress and effort over time
  const generateDummyData = () => {
    const dataPoints = [];
    const startTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (let i = 0; i < 15; i++) {
      const timestamp = startTime + (i * 2 * 24 * 60 * 60 * 1000); // Every 2 days
      dataPoints.push({
        timestamp,
        progress: Math.max(0, Math.min(10, 1 + i * 0.6 + Math.sin(i * 0.5) * 1.5)),
        effort: Math.max(0, Math.min(10, 2 + i * 0.4 + Math.cos(i * 0.7) * 2))
      });
    }
    
    return dataPoints;
  };

  const chartData = generateDummyData();

  // Create SVG path for progress line
  const createProgressPath = (data: typeof chartData) => {
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const xScale = (timestamp: number) => {
      const minTime = Math.min(...data.map(d => d.timestamp));
      const maxTime = Math.max(...data.map(d => d.timestamp));
      return margin.left + ((timestamp - minTime) / (maxTime - minTime)) * chartWidth;
    };
    
    const yScale = (value: number) => {
      return margin.top + chartHeight - (value / 10) * chartHeight;
    };
    
    return data.map((d, i) => 
      i === 0 ? `M ${xScale(d.timestamp)} ${yScale(d.progress)}` : 
      `L ${xScale(d.timestamp)} ${yScale(d.progress)}`
    ).join(' ');
  };

  // Create SVG path for effort line
  const createEffortPath = (data: typeof chartData) => {
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const xScale = (timestamp: number) => {
      const minTime = Math.min(...data.map(d => d.timestamp));
      const maxTime = Math.max(...data.map(d => d.timestamp));
      return margin.left + ((timestamp - minTime) / (maxTime - minTime)) * chartWidth;
    };
    
    const yScale = (value: number) => {
      return margin.top + chartHeight - (value / 10) * chartHeight;
    };
    
    return data.map((d, i) => 
      i === 0 ? `M ${xScale(d.timestamp)} ${yScale(d.effort)}` : 
      `L ${xScale(d.timestamp)} ${yScale(d.effort)}`
    ).join(' ');
  };

  const progressPath = createProgressPath(chartData);
  const effortPath = createEffortPath(chartData);

  return (
    <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
      <div className="relative w-[600px] h-[300px]">
        <svg width="600" height="300" viewBox="0 0 600 300">
          {/* X Axis */}
          <line 
            x1="30" 
            y1="270" 
            x2="570" 
            y2="270" 
            stroke="rgba(113, 160, 198, 0.3)" 
            strokeWidth="1"
          />
          
          {/* Y Axis */}
          <line 
            x1="30" 
            y1="20" 
            x2="30" 
            y2="270" 
            stroke="rgba(113, 160, 198, 0.3)" 
            strokeWidth="1"
          />

          {/* Progress Line (Blue) */}
          <motion.path
            d={progressPath}
            fill="none"
            stroke="rgba(113, 160, 198, 0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1000"
            initial={{ 
              strokeDashoffset: 1000
            }}
            animate={{ 
              strokeDashoffset: [1000, 0, 0, -1000]
            }}
            transition={{ 
              duration: 9,
              delay: 0,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut"
            }}
          />

          {/* Effort Line (Green) */}
          <motion.path
            d={effortPath}
            fill="none"
            stroke="rgba(34, 197, 94, 0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1000"
            initial={{ 
              strokeDashoffset: 1000
            }}
            animate={{ 
              strokeDashoffset: [1000, 0, 0, -1000]
            }}
            transition={{ 
              duration: 9,
              delay: 0,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>
    </div>
  )
}

// Becomes You Visualization Component
const BecomesYouVisualization = () => {
  return (
    <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
      <div className="relative w-[600px] h-[400px] flex items-center justify-center">
        
        {/* Single Morphing Face */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="glass relative rounded-2xl border border-primary-400/30 p-8 shadow-xl">
            <svg width="120" height="120" viewBox="0 0 120 120" className="text-primary-400">
              
              {/* Robot/Human Head - morphs from square to circle */}
              <motion.rect
                x="30" y="30" width="60" height="60" 
                rx="8"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                animate={{ 
                  rx: [8, 8, 8, 30, 30, 30, 30],
                  ry: [0, 0, 0, 30, 30, 30, 30]
                }}
                transition={{ 
                  duration: 8,
                  delay: 0,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              />
              
              {/* Left Eye - morphs from square to circle */}
              <motion.rect 
                x="42" y="48" width="12" height="12" 
                rx="0"
                fill="currentColor"
                animate={{ 
                  rx: [0, 0, 0, 0, 4, 4, 4],
                  ry: [0, 0, 0, 0, 4, 4, 4]
                }}
                transition={{ 
                  duration: 8,
                  delay: 0,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              />
              
              {/* Right Eye - morphs from square to circle */}
              <motion.rect 
                x="66" y="48" width="12" height="12" 
                rx="0"
                fill="currentColor"
                animate={{ 
                  rx: [0, 0, 0, 0, 4, 4, 4],
                  ry: [0, 0, 0, 0, 4, 4, 4]
                }}
                transition={{ 
                  duration: 8,
                  delay: 0,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              />
              
              {/* Antenna - disappears */}
              <motion.g
                animate={{ 
                  opacity: [1, 1, 1, 1, 1, 0, 0]
                }}
                transition={{ 
                  duration: 8,
                  delay: 0,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              >
                <line 
                  x1="60" y1="22" x2="60" y2="30" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <circle 
                  cx="60" cy="18" r="4" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
              </motion.g>
              
              {/* Mouth - transforms from line to smile */}
              <motion.path
                d="M45 72 L75 72"
                stroke="currentColor" 
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                animate={{ 
                  d: [
                    "M45 72 L75 72",           // Step 1: straight line
                    "M45 72 L75 72",           // Step 2: still straight
                    "M45 72 L75 72",           // Step 3: still straight  
                    "M45 72 L75 72",           // Step 4: still straight
                    "M45 72 L75 72",           // Step 5: still straight
                    "M45 72 L75 72",           // Step 6: still straight
                    "M45 72 Q60 82 75 72"      // Step 7: becomes smile
                  ]
                }}
                transition={{ 
                  duration: 8,
                  delay: 0,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              />

            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}

// Trained on Best Practices Visualization Component
const TrainedOnBestPracticesVisualization = () => {
  return (
    <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
      <div className="relative w-[600px] h-[400px] flex items-center justify-center">
        
        {/* Central Robot Face */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="glass relative rounded-2xl border border-primary-400/30 p-6 shadow-xl"
            animate={{ 
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 25px 50px -12px rgba(113, 160, 198, 0.25)",
                "0 25px 50px -12px rgba(113, 160, 198, 0.4)",
                "0 25px 50px -12px rgba(113, 160, 198, 0.25)"
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="100" height="100" viewBox="0 0 100 100" className="text-primary-400">
              {/* Robot head outline */}
              <rect 
                x="20" y="25" width="60" height="50" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                rx="12"
              />
              
              {/* Robot eyes (square) with blinking */}
              <motion.rect 
                x="32" y="40" width="10" height="10" 
                fill="currentColor"
                animate={{ 
                  scaleY: [1, 0.1, 1, 1, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.rect 
                x="58" y="40" width="10" height="10" 
                fill="currentColor"
                animate={{ 
                  scaleY: [1, 0.1, 1, 1, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Robot mouth (happy line) */}
              <path 
                d="M38 58 Q50 65 62 58" 
                stroke="currentColor" 
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Robot antenna with pulsing */}
              <motion.line 
                x1="50" y1="20" x2="50" y2="25" 
                stroke="currentColor" 
                strokeWidth="2"
                animate={{ 
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.circle 
                cx="50" cy="16" r="4" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Floating Books around the robot */}
        {[
          { x: -150, y: -80, rotation: -15, delay: 0 },
          { x: 150, y: -60, rotation: 12, delay: 0.5 },
          { x: -120, y: 100, rotation: 8, delay: 1 },
          { x: 140, y: 120, rotation: -10, delay: 1.5 }
        ].map((book, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `calc(50% + ${book.x}px)`,
              top: `calc(50% + ${book.y}px)`,
              transform: `translate(-50%, -50%) rotate(${book.rotation}deg)`
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.8],
              y: [20, 0, 0, 20],
              rotate: [book.rotation, book.rotation + 5, book.rotation]
            }}
            transition={{ 
              duration: 6,
              delay: book.delay,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          >
            <div className="glass-dark rounded-lg border border-primary-400/20 p-3 shadow-lg">
              <svg width="40" height="30" viewBox="0 0 40 30" className="text-primary-300">
                {/* Book cover */}
                <rect 
                  x="2" y="4" width="36" height="22" 
                  fill="currentColor" 
                  opacity="0.3"
                  rx="2"
                />
                {/* Book spine */}
                <rect 
                  x="2" y="4" width="4" height="22" 
                  fill="currentColor" 
                  opacity="0.6"
                  rx="1"
                />
                {/* Book lines */}
                <line x1="10" y1="10" x2="32" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="10" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="10" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
              </svg>
            </div>
          </motion.div>
        ))}

        {/* Knowledge absorption particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: `${30 + i * 8}%`,
              top: `${25 + (i % 3) * 25}%`,
              backgroundColor: `rgba(113, 160, 198, ${0.3 + (i % 3) * 0.2})`
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
              x: [0, (50 - (30 + i * 8)) * 6, 0],
              y: [0, (50 - (25 + (i % 3) * 25)) * 4, 0]
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Pulsing aura around robot */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(113, 160, 198, 0.1) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

      </div>
    </div>
  )
}

// Customize Your Replica Visualization Component
const CustomizeReplicaVisualization = () => {
  const characters = [
    { id: 1, image: churchillImage, name: "Churchill" },
    { id: 2, image: houseImage, name: "House" },
    { id: 3, image: yodaImage, name: "Yoda" }
  ]

  return (
    <div className="flex items-center justify-center h-[400px] w-full">
      <div className="flex space-x-8">
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20 blur-lg"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
              />
              <img 
                src={character.image} 
                alt={character.name}
                className="relative w-24 h-24 rounded-full object-cover border-3 border-primary-400/30 shadow-xl"
              />
            </div>
            <p className="mt-3 text-center text-sm text-white/70 font-medium">{character.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Dashboard Visualization Component
const DashboardVisualization = () => {
  return (
    <div className="flex items-center justify-center h-[400px] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        className="relative max-w-lg w-full"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 to-primary-600/10 blur-xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <img 
            src={dashboardImage} 
            alt="Interactive Dashboard"
            className="relative w-full rounded-2xl shadow-2xl border border-primary-400/20"
          />
        </div>
      </motion.div>
    </div>
  )
}

// Feature list for the carousel
const features = [
  {
    title: 'Helps you think clearly',
    description: 'Foresee challenges and plan your actions.\nDefine the timeline.\nWrite it down.',
    animation: <StrategicThinkingVisualization />
  },
  {
    title: 'Helps You Stay on Track',
    description: 'Record progress and effort invested.\nStay motivated.\nRemain accountable.\nEffortlessly.',
    animation: <StayOnTrackVisualization />
  },
  {
    title: 'Becomes you eventually.',
    description: 'Learns your thinking and communication patterns over time.\nRemembers everything you tell it.\nGets better with every interaction.',
    animation: <BecomesYouVisualization />
  },
  {
    title: 'Trained on Proven Best Practices',
    description: 'So you can skip the theory and just do it.\nDon\'t watch tons of productivity videos - Navi did it for you.',
    animation: <TrainedOnBestPracticesVisualization />
  },
  {
    title: 'Customize Your Replica',
    description: 'Have fun!',
    animation: <CustomizeReplicaVisualization />
  },
  {
    title: 'See Goals & Progress at a Glance',
    description: 'Interactive dashboard.',
    animation: <DashboardVisualization />
  }
]

export default LandingPage 