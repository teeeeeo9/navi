import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoImage from '@/assets/logo.png'

const LandingPage = () => {
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
                className="glass-dark rounded-full px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
              >
                Log in
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/register" 
                className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-primary-500/25 hover:shadow-xl"
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
            whileHover={{ 
              scale: 1.1, 
              rotate: 360,
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 blur-xl opacity-30"></div>
              <img src={logoImage} alt="Navi Logo" className="relative h-28 w-auto" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="mb-6 text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            Strategic Goal Planning <br />
            <motion.span 
              className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              Powered by AI
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto mb-12 max-w-2xl text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Navi helps you set meaningful goals, create strategic plans, and track your progress with the help of advanced AI assistance.
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
                className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-10 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-primary-500/30 hover:shadow-2xl"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a 
                href="#features" 
                className="glass rounded-full border border-primary-400/50 px-10 py-4 text-lg font-medium text-primary-400 transition-all duration-300 hover:bg-primary-400/10 hover:border-primary-400"
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
            className="glass mx-auto max-w-5xl rounded-3xl p-10 text-center shadow-2xl"
          >
            <motion.div 
              className="mb-8 flex justify-center"
              whileInView={{ scale: [0.8, 1.1, 1] }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/30 to-primary-600/30 blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* <div className="relative flex h-24 w-24 items-center justify-center rounded-full glass-dark">
                  <img src={logoImage} alt="Sensay Logo" className="h-18 w-auto" />
                </div> */}
              </div>
            </motion.div>
            
            <motion.h2 
              className="mb-6 text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Powered by Sensay AI
            </motion.h2>
            
            <motion.p 
              className="mb-10 text-lg text-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Sensay is at the heart of Navi, providing intelligent assistance for your goal planning and strategic thinking. The advanced AI understands your goals, provides personalized guidance, and helps you stay on track.
            </motion.p>
            
            <div className="mx-auto flex max-w-3xl flex-col space-y-6 text-left">
              {[
                {
                  title: "Conversational Guidance",
                  description: "Interact naturally with an AI assistant that handles all goal-related actions, provides personalized advice, and helps you overcome obstacles."
                },
                {
                  title: "Intelligent Analysis", 
                  description: "Sensay AI analyzes your goals, progress, and patterns to provide strategic insights and suggestions tailored to your specific needs."
                },
                {
                  title: "Adaptive Interaction",
                  description: "The AI adapts its interaction style based on your history and preferences, becoming more helpful as it learns about your goals and challenges."
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="glass-dark rounded-xl p-6 transition-all duration-300 hover:bg-white/5"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="mb-3 text-xl font-medium text-primary-400">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold">Key Features</h2>
          <p className="mx-auto max-w-2xl text-xl text-white/80">
            Navi combines powerful planning tools with artificial intelligence to make goal setting and achievement easier than ever.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="glass group rounded-2xl p-8 transition-all duration-300 hover:bg-white/5"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <motion.div 
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="mb-4 text-xl font-bold transition-colors group-hover:text-primary-400">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
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
              Ready to Achieve Your Goals?
            </motion.h2>
            <motion.p 
              className="mx-auto mb-10 max-w-2xl text-xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join Navi today and experience the power of AI-assisted goal planning and achievement.
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
                className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-12 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-primary-500/30 hover:shadow-2xl"
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
            © {new Date().getFullYear()} Navi. Powered by Sensay AI.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}

// Feature list for the features section
const features = [
  {
    title: 'Goal Setting',
    description: 'Define clear, meaningful goals with descriptions, timelines, and importance.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Milestones',
    description: 'Break goals into achievable milestones with their own deadlines for better tracking.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Progress Tracking',
    description: 'Track progress on goals and visualize your journey with beautiful charts and statistics.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Reflections',
    description: 'Capture thoughts on the importance of goals, potential obstacles, and strategies.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
      </svg>
    )
  }
]

export default LandingPage 