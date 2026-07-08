import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Building2, ChevronDown, ClipboardList, MapPinned, ShieldCheck } from 'lucide-react'
import { buttonTap, sectionGroup, sectionItem, sectionViewport } from '../lib/motion.js'
import { type } from '../lib/typography.js'

const faqs = [
  {
    id: 'faq-heatmap',
    question: 'What does the heatmap actually show?',
    answer:
      'It is a planning-level ground response screen for Bangladesh. Higher areas indicate ground conditions that may be more sensitive to shaking, settlement, strength loss, lateral spreading, or liquefaction-related deformation. It is not a live earthquake map and it is not a formal LPI map.',
    icon: MapPinned,
  },
  {
    id: 'faq-heatmap-data',
    question: 'What data sources support the heatmap?',
    answer:
      'The displayed layer comes from the project hazard grid and a compact static heatmap cache generated from the ground-susceptibility dataset. The UI uses percentile-normalized display scores so the regional pattern is readable, while the private source CSV is not required in the public frontend.',
    icon: ShieldCheck,
  },
  {
    id: 'faq-questionnaires',
    question: 'How should I answer the inspection questionnaire?',
    answer:
      'Pick the closest answer you can see or know. If you are not sure, choose Unknown or Unsure instead of guessing.',
    details: [
      'Building age: choose Under 10, 10-30, or Over 30 years based on when the building was built. Use Unknown if you do not know.',
      'Number of stories: count the floors above ground. A ground floor plus two upper floors means 3 stories.',
      'Soft story: choose Yes if the ground floor is mostly open, like parking, shops, large glass fronts, or few walls. Choose No if it has normal walls and rooms.',
      'RC Frame: reinforced concrete frame. This usually means concrete columns and beams carry the building.',
      'Masonry: brick, block, or stone walls carry much of the building weight. Many older brick buildings are masonry.',
      'Informal / Other: choose this for mixed, temporary, visibly irregular, or unclear construction.',
      'Foundation settlement signs: choose Yes if floors slope, doors/windows jam, walls separate from floors, or one side looks like it has sunk.',
      'Prior earthquake damage: choose Yes if the building had earlier earthquake cracks, repairs, tilting, or official damage warnings.',
      'Column/Beam joint: the corner where a vertical column meets a horizontal beam. Cracks here can be more serious.',
      'Load-bearing wall: a wall that supports the building above it, not just a divider. Thick brick/block walls are often load-bearing.',
      'Plaster / Partition: surface plaster or thin divider walls. Cracks here can still matter, but are often less serious than structural cracks.',
    ],
    icon: ClipboardList,
  },
  {
    id: 'faq-inspection',
    question: 'How does building inspection work?',
    answer:
      'The inspection flow combines visible crack evidence, questionnaire inputs, and optional location-based hazard context into a screening result. It is designed to flag concern and guide next steps, not replace a licensed structural or geotechnical assessment.',
    icon: Building2,
  },
  {
    id: 'faq-alerts-relief',
    question: 'How do alerts and relief tools help?',
    answer:
      'Alerts summarize recent earthquake information and news signals. Relief helps search nearby open places and fire-service resources so users can plan safer assembly options after shaking or during emergency preparation.',
    icon: Bell,
  },
]

function FAQCard({ item, index, isOpen, onToggle }) {
  const Icon = item.icon

  return (
    <motion.article
      id={item.id}
      className={`group relative scroll-mt-[110px] overflow-hidden rounded-lg border text-left shadow-[0_18px_48px_rgba(18,18,18,0.075)] transition-colors ${
        isOpen
          ? 'border-[#121212] bg-[#121212] text-white'
          : 'border-[#dedede] bg-white text-[#121212] hover:border-[#bdbdbd]'
      }`}
      layout
      transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 transition-colors ${
          isOpen ? 'bg-[#ff5330]' : 'bg-[#ececec] group-hover:bg-[#ff5330]'
        }`}
        aria-hidden="true"
      />
      <button
        type="button"
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left sm:gap-5 sm:px-7 sm:py-6 md:px-8"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        onClick={onToggle}
      >
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors sm:h-[52px] sm:w-[52px] md:h-14 md:w-14 ${
            isOpen
              ? 'border-white/10 bg-white/10 text-[#ff5330]'
              : 'border-[#ececec] bg-[#fafafa] text-[#ff5330]'
          }`}
        >
          <Icon size={22} />
        </span>

        <span className="min-w-0">
          <span className="block !text-left text-[13px] font-extrabold leading-none tracking-[0.08em] text-[#ff5330]">
            0{index + 1}
          </span>
          <span className={`mt-2 block text-[19px] font-extrabold leading-[1.22] sm:text-[20px] md:text-[22px] ${
            isOpen ? 'text-white' : 'text-[#121212]'
          }`}>
            {item.question}
          </span>
        </span>

        <motion.span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors sm:h-11 sm:w-11 ${
            isOpen
              ? 'border-[#ff5330] bg-[#ff5330] text-white'
              : 'border-[#d8d8d8] bg-[#fafafa] text-[#555]'
          }`}
          whileTap={buttonTap}
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-7 md:px-8">
              <p className={`m-0 max-w-[980px] !text-left text-[#d7d7d7] ${type.bodySmall}`}>
                {item.answer}
              </p>
              {item.details && (
                <ul className={`m-0 mt-4 grid max-w-[980px] gap-2 pl-5 text-[#d7d7d7] ${type.bodySmall}`}>
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

function getIndexFromHash() {
  if (typeof window === 'undefined') return null

  const id = window.location.hash.replace('#', '')
  const index = faqs.findIndex((item) => item.id === id)
  return index >= 0 ? index : null
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(getIndexFromHash)

  useEffect(() => {
    const openFromHash = () => {
      const index = getIndexFromHash()
      if (index != null) setOpenIndex(index)
    }

    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  return (
    <section id="faq" className="scroll-mt-[100px] bg-[#fafafa]">
      <motion.div
        className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20 lg:px-16 lg:py-[112px] xl:px-20"
        variants={sectionGroup}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div className="mx-auto max-w-[720px] text-center" variants={sectionItem}>
          <span className="mx-auto mb-5 block h-0.5 w-12 bg-[#ff5330]" aria-hidden="true" />
          <p className={`mb-3 text-[#ff5330] ${type.overline}`}>Frequently asked questions</p>
          <h2 className={type.sectionTitle}>Clear answers before you act</h2>
          <p className={`mx-auto mt-5 max-w-[615px] text-[#5e5e5e] ${type.body}`}>
            A quick guide to what Kompon shows, how the screening tools work,
            and where the limits are.
          </p>
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-1 gap-4 sm:gap-5"
          variants={sectionItem}
        >
          {faqs.map((item, index) => (
            <FAQCard
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default FAQSection
