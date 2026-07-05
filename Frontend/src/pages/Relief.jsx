import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, MapPin, Mail } from 'lucide-react'
import MediaPlaceholder from '../components/MediaPlaceholder.jsx'
import { buttonHover, buttonTap, sectionGroup, sectionItem, sectionViewport } from '../lib/motion.js'
import { type } from '../lib/typography.js'

const reliefItems = [
  {
    title: 'Temporary shelter',
    meta: 'Available now',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.',
  },
  {
    title: 'Food support',
    meta: 'High priority',
    body: 'Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam.',
  },
  {
    title: 'Medical assistance',
    meta: 'Open intake',
    body: 'Suspendisse varius enim in eros elementum tristique. Duis cursus mi quis viverra.',
  },
  {
    title: 'Transport route',
    meta: 'Updated today',
    body: 'Eros dolor interdum nulla, ut commodo diam libero vitae erat.',
  },
  {
    title: 'Family support desk',
    meta: 'Limited slots',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius.',
  },
]

function ReliefCard({ item, index, className = '' }) {
  return (
    <motion.article
      className={`border border-[#ddd] bg-[#f4f4f4] p-4 ${className}`}
      key={item.title}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className={`m-0 text-[#121212] ${type.label}`}>{item.title}</h4>
        <span className={`shrink-0 font-bold text-[#ff5330] ${type.legal}`}>
          0{index + 1}
        </span>
      </div>
      <div className={`mb-3 flex items-center gap-2 font-bold text-[#2b2b2b] ${type.meta}`}>
        <MapPin size={14} />
        {item.meta}
      </div>
      <p className={`m-0 text-[#5e5e5e] ${type.bodySmall}`}>{item.body}</p>
    </motion.article>
  )
}

function Relief() {
  const [activeResource, setActiveResource] = useState(0)
  const activeItem = reliefItems[activeResource]

  const showPrevious = () => {
    setActiveResource((current) => (current === 0 ? reliefItems.length - 1 : current - 1))
  }

  const showNext = () => {
    setActiveResource((current) => (current === reliefItems.length - 1 ? 0 : current + 1))
  }

  return (
    <section id="relief" className="scroll-mt-[66px]">
      <motion.div
        className="mx-auto grid w-full max-w-[1440px] justify-items-center gap-12 px-5 py-14 sm:px-8 sm:py-16 md:gap-[70px] md:px-10 md:py-20 lg:px-16 lg:py-[112px] xl:px-20"
        variants={sectionGroup}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div
          className="w-full max-w-[660px] text-center"
          variants={sectionItem}
        >
          <h2 className={type.sectionTitle}>
            Medium length heading goes here
          </h2>
          <p className={`mx-auto my-5 max-w-[615px] text-[#5e5e5e] md:mb-7 ${type.body}`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique.
          </p>
          <form
            className="mx-auto mb-3.5 grid max-w-[520px] gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="relative block">
              <span className="sr-only">Email address</span>
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5e5e5e]" />
              <input
                className={`min-h-[44px] w-full border border-[#c8c8c8] bg-[#fafafa] px-10 text-[#121212] outline-none focus:border-[#ff5330] ${type.bodySmall}`}
                type="email"
                placeholder="Enter your email"
              />
            </label>
            <motion.button
              className={`inline-flex min-h-11 items-center justify-center border border-[#ff5330] bg-[#ff5330] px-5 text-white ${type.button}`}
              type="submit"
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              Sign Up
            </motion.button>
          </form>
        <small className={`block !text-center text-[#5e5e5e] ${type.legal}`}>
            By clicking Sign Up you&apos;re confirming that you agree with our
            Terms and Conditions.
          </small>
        </motion.div>

        <motion.div
          className="mx-auto grid w-full max-w-[630px] gap-5 lg:max-w-none lg:min-h-[500px] lg:grid-cols-[2fr_1fr] lg:gap-6"
          variants={sectionItem}
        >
          <MediaPlaceholder
            className="min-h-[300px] w-full sm:min-h-[360px] md:min-h-[430px] lg:min-h-full"
            label="Relief image placeholder"
          />

          <div className="hidden max-h-[360px] min-h-[300px] flex-col border border-[#c8c8c8] bg-[#fafafa] md:max-h-none md:min-h-full lg:flex">
            <div className="border-b border-[#c8c8c8] px-4 py-4">
              <h3 className={`m-0 text-[#121212] ${type.cardTitle}`}>Relief resources</h3>
              <p className={`mt-1 font-medium text-[#5e5e5e] ${type.meta}`}>Scrollable stacked list</p>
            </div>
            <div className="grid flex-1 gap-3 overflow-y-auto p-4">
              {reliefItems.map((item, index) => (
                <ReliefCard item={item} index={index} key={item.title} />
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col border border-[#c8c8c8] bg-[#fafafa] lg:hidden">
            <div className="border-b border-[#c8c8c8] px-4 py-4 sm:px-5">
              <h3 className={`m-0 text-[#121212] ${type.cardTitle}`}>Relief resources</h3>
              <p className={`mt-1 font-medium text-[#5e5e5e] ${type.meta}`}>Swipe through available support</p>
            </div>
            <div className="p-4 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.title}
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -22 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <ReliefCard item={activeItem} index={activeResource} className="min-h-[170px]" />
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex gap-2" aria-label="Relief resource position">
                  {reliefItems.map((item, index) => (
                    <button
                      key={item.title}
                      className={`h-1.5 rounded-full border-0 p-0 transition-all ${
                        index === activeResource ? 'w-6 bg-[#ff5330]' : 'w-1.5 bg-[#c8c8c8]'
                      }`}
                      type="button"
                      aria-label={`Show ${item.title}`}
                      onClick={() => setActiveResource(index)}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <motion.button
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#222] bg-[#fafafa] text-[#121212]"
                    type="button"
                    aria-label="Previous relief resource"
                    onClick={showPrevious}
                    whileHover={{ x: -2 }}
                    whileTap={buttonTap}
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                  <motion.button
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#222] bg-[#fafafa] text-[#121212]"
                    type="button"
                    aria-label="Next relief resource"
                    onClick={showNext}
                    whileHover={{ x: 2 }}
                    whileTap={buttonTap}
                  >
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Relief
