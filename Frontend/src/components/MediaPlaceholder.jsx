import { Image, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { sectionItem } from '../lib/motion.js'

function MediaPlaceholder({ className = '', kind = 'image', label = 'Image placeholder' }) {
  return (
    <motion.div
      className={`flex items-center justify-center overflow-hidden bg-[#ddd] ${className}`}
      aria-label={label}
      variants={sectionItem}
    >
      {kind === 'video' ? (
        <motion.span
          className="grid h-[76px] w-[116px] place-items-center rounded-[10px] bg-[#222] text-[#ff5330]"
          aria-hidden="true"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play size={34} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ) : (
        <motion.span
          className="grid h-16 w-20 place-items-center rounded-lg bg-[#c8c8c8] text-[#5e5e5e]"
          aria-hidden="true"
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Image size={42} strokeWidth={2.2} />
        </motion.span>
      )}
    </motion.div>
  )
}

export default MediaPlaceholder
