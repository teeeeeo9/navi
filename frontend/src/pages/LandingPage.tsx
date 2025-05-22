import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-white">
      {/* Header/Navigation */}
      <header className="glass-dark z-10 flex justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Navi</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="rounded-full bg-dark-700/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-600"
          >
            Log in
          </Link>
          <Link 
            to="/register" 
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl font-bold leading-tight">
            Strategic Goal Planning <br />
            <span className="text-primary-400">Powered by AI</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-dark-100">
            Navi helps you set meaningful goals, create strategic plans, and track your progress with the help of advanced AI assistance.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/register" 
              className="rounded-full bg-primary-500 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-600"
            >
              Get Started
            </Link>
            <a 
              href="#features" 
              className="rounded-full border border-primary-400 px-8 py-3 text-lg font-medium text-primary-400 transition-colors hover:bg-primary-400/10"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Sensay Section */}
      <section className="bg-dark-800/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass mx-auto max-w-4xl rounded-2xl p-8 text-center"
          >
            <div className="mb-6 flex justify-center">
              {/* Sensay Logo - A simple placeholder since we don't have the actual logo */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/20 text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12">
                  <path d="M16.5 7.5h-9v9h9v-9Z" />
                  <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold">Powered by Sensay AI</h2>
            <p className="mb-6 text-lg text-dark-100">
              Sensay is at the heart of Navi, providing intelligent assistance for your goal planning and strategic thinking. The advanced AI understands your goals, provides personalized guidance, and helps you stay on track.
            </p>
            <div className="mx-auto flex max-w-2xl flex-col space-y-4 text-left">
              <div className="glass-dark rounded-lg p-4">
                <h3 className="mb-2 text-xl font-medium text-primary-400">Conversational Guidance</h3>
                <p className="text-dark-100">Interact naturally with an AI assistant that handles all goal-related actions, provides personalized advice, and helps you overcome obstacles.</p>
              </div>
              <div className="glass-dark rounded-lg p-4">
                <h3 className="mb-2 text-xl font-medium text-primary-400">Intelligent Analysis</h3>
                <p className="text-dark-100">Sensay AI analyzes your goals, progress, and patterns to provide strategic insights and suggestions tailored to your specific needs.</p>
              </div>
              <div className="glass-dark rounded-lg p-4">
                <h3 className="mb-2 text-xl font-medium text-primary-400">Adaptive Interaction</h3>
                <p className="text-dark-100">The AI adapts its interaction style based on your history and preferences, becoming more helpful as it learns about your goals and challenges.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Key Features</h2>
          <p className="mx-auto max-w-2xl text-xl text-dark-100">
            Navi combines powerful planning tools with artificial intelligence to make goal setting and achievement easier than ever.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-dark-100">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold">Ready to Achieve Your Goals?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-dark-100">
              Join Navi today and experience the power of AI-assisted goal planning and achievement.
            </p>
            <Link 
              to="/register" 
              className="rounded-full bg-primary-500 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-600"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-dark-300">
            © {new Date().getFullYear()} Navi. Powered by Sensay AI.
          </p>
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
    title: 'Hierarchical Goals',
    description: 'Create nested goals and subgoals for better organization of complex objectives.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M6.429 9.75 2.25 12l4.179 2.25v-4.5ZM6.429 16.5 2.25 18.75l4.179 2.25v-4.5ZM6.429 3 2.25 5.25l4.179 2.25v-4.5ZM12.75 6.75h-1.5v10.5h1.5V6.75ZM12 5.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12 21a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM17.571 12 21.75 9.75l-4.179-2.25v4.5ZM17.571 5.25 21.75 3l-4.179-2.25v4.5ZM17.571 18.75 21.75 16.5l-4.179-2.25v4.5Z" clipRule="evenodd" />
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
  },
  {
    title: 'Glass Morphism UI',
    description: 'Modern transparent/glass UI elements that create depth and visual appeal.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd" />
      </svg>
    )
  }
]

export default LandingPage 