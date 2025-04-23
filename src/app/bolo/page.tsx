'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BoloPage() {
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='text-center p-10 bg-black/30 backdrop-blur-md rounded-2xl max-w-2xl mx-auto border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]'
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className='text-5xl font-bold text-white mb-6'
        >
          Welcome to <span className='text-purple-400'>Bolo</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className='text-xl text-white/80 mb-8'
        >
          Congratulations! You&apos;ve successfully entered the secret area.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className='space-y-4 text-white/70'
        >
          <p>
            This exclusive area is reserved for those who know the password. Here you&apos;ll find
            the latest updates and special features as we develop Pulse.
          </p>

          <p>Stay tuned for more secrets and hidden features throughout our website.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className='mt-10'
        >
          <Link href='/'>
            <button className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-[0_0_10px_rgba(139,92,246,0.5)]'>
              Return to Home
            </button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className='absolute bottom-4 text-white/30 text-xs'
      >
        Did you know? There are other easter eggs hidden in the password field...
      </motion.div>
    </div>
  );
}
