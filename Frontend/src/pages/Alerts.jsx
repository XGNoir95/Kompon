import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import MediaPlaceholder from '../components/MediaPlaceholder.jsx'
import { buttonTap, sectionGroup, sectionItem, sectionViewport } from '../lib/motion.js'
import { type } from '../lib/typography.js'

const alerts = [
  {
    quote:
      'A testimonial that shares a customer positive experience with your company and answers potential customer doubts. Showcases testimonials from a similar demographic to your customers.',
    name: 'Name Surname',
    role: 'Position, Company name',
  },
  {
    quote:
      'A concise alert story can explain the value of clear communication during urgent moments.',
    name: 'Name Surname',
    role: 'Position, Company name',
  },
  {
    quote:
      'Use this slider for updates, reports, or public service messages that need extra attention.',
    name: 'Name Surname',
    role: 'Position, Company name',
  },
]

function Alerts() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeAlert = alerts[activeIndex]

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? alerts.length - 1 : current - 1))
  }

  const showNext = () => {
    setActiveIndex((current) => (current === alerts.length - 1 ? 0 : current + 1))
  }

  return (
    <section id="alerts" className="scroll-mt-[66px]">
      <motion.div
        className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-16 lg:py-16 xl:px-20"
        variants={sectionGroup}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.h2
          className={`mx-auto mb-8 text-center md:mb-10 lg:mb-12 ${type.sectionTitle}`}
          variants={sectionItem}
        >
          Don&apos;t just take our word for it
        </motion.h2>

        <motion.div
          className="grid items-center gap-8 md:gap-9 lg:grid-cols-[minmax(360px,540px)_minmax(0,1fr)] lg:gap-10 xl:gap-12"
          variants={sectionItem}
        >
          <MediaPlaceholder
            className="order-2 mx-auto aspect-square w-full max-w-[630px] bg-[#ddd] lg:order-1"
            kind="video"
            label="Video placeholder"
          />

          <AnimatePresence mode="wait">
            <motion.article
              key={activeIndex}
              className="order-1 max-w-[560px] mx-auto lg:order-2 lg:max-w-[560px]"
              aria-live="polite"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              <div className="mb-[22px] flex gap-1 text-[#ff5330]" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="m-0 text-justify text-[20px] font-extrabold leading-[1.35] sm:text-[22px] md:text-[24px]">
                {activeAlert.quote}
              </blockquote>
              <div className="mt-8 flex items-start gap-4 md:items-center md:gap-7">
                <div>
                  <strong className={`block text-[#121212] ${type.label}`}>{activeAlert.name}</strong>
                  <span className={`block text-[#5e5e5e] ${type.meta}`}>{activeAlert.role}</span>
                </div>
                <div className="min-h-[34px] border-l border-[#c8c8c8] pl-7 text-sm font-extrabold">
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mx-auto mt-6 flex w-full max-w-[630px] items-center justify-between md:mt-10 lg:max-w-none"
          variants={sectionItem}
        >
          <div className="flex gap-2" aria-label="Slide position">
            {alerts.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full border-0 p-0 transition-all ${
                  index === activeIndex ? 'w-6 bg-[#ff5330]' : 'w-1.5 bg-[#c8c8c8]'
                }`}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <div className="flex gap-3.5">
            <motion.button
              className="grid h-10 w-10 place-items-center rounded-full border border-[#222] bg-[#fafafa] text-[#121212]"
              type="button"
              aria-label="Previous alert"
              onClick={showPrevious}
              whileHover={{ x: -2 }}
              whileTap={buttonTap}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <motion.button
              className="grid h-10 w-10 place-items-center rounded-full border border-[#222] bg-[#fafafa] text-[#121212]"
              type="button"
              aria-label="Next alert"
              onClick={showNext}
              whileHover={{ x: 2 }}
              whileTap={buttonTap}
            >
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Alerts
