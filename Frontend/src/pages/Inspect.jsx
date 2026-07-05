import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardCheck,
  Code2,
  Globe2,
  Mail,
  Monitor,
  PenTool,
  Search,
  User,
  Users,
} from 'lucide-react'
import MediaPlaceholder from '../components/MediaPlaceholder.jsx'
import { buttonTap, sectionGroup, sectionItem, sectionViewport } from '../lib/motion.js'
import { type } from '../lib/typography.js'

const formSteps = [
  {
    title: "Let's start with your name & email",
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
  },
  {
    title: 'What can we help you with?',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
  },
  {
    title: "Let's confirm your company info",
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
  },
  {
    title: 'Finally, confirm your availability',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
  },
  {
    title: 'Review and submit your request',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Confirm your details before sending your request.',
  },
]

const services = [
  { label: 'Website design', icon: PenTool, active: false },
  { label: 'Webflow development', icon: Code2, active: true },
  { label: 'Custom code solutions', icon: Monitor, active: false },
  { label: 'Other', icon: BriefcaseBusiness, active: false },
]

function StepIndicator({ activeStep }) {
  return (
    <div className="mb-[30px] flex w-full items-center" aria-label={`Step ${activeStep + 1} of ${formSteps.length}`}>
      {formSteps.map((_, index) => {
        const isActive = index === activeStep
        const isComplete = index < activeStep

        return (
          <div className="flex flex-1 items-center last:flex-none" key={index}>
            <motion.span
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold sm:h-9 sm:w-9 md:h-10 md:w-10 ${
                isComplete
                  ? 'border-[#121212] bg-[#121212] text-white'
                  : isActive
                    ? 'border-[#ff5330] bg-[#fafafa] text-[#ff5330]'
                    : 'border-[#c8c8c8] bg-[#fafafa] text-[#5e5e5e]'
              }`}
              aria-hidden="true"
              animate={{
                scale: isActive ? 1.1 : 1,
                borderColor: isComplete ? '#121212' : isActive ? '#ff5330' : '#c8c8c8',
                backgroundColor: isComplete ? '#121212' : '#fafafa',
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isComplete ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="number"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                  >
                    {index + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
            {index < formSteps.length - 1 && (
              <span className="relative h-px flex-1 overflow-hidden bg-[#c8c8c8]" aria-hidden="true">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-[#ff5330]"
                  initial={false}
                  animate={{ width: index < activeStep ? '100%' : '0%' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const buttonBase = `inline-flex min-h-10 items-center justify-center gap-2 border px-5 transition-transform hover:-translate-y-0.5 ${type.button}`
const outlineButton = `${buttonBase} border-[#222] bg-[#fafafa] text-[#121212]`
const darkButton = `${buttonBase} border-[#ff5330] bg-[#ff5330] text-white`
const fieldClass = `min-h-[44px] w-full border border-[#c8c8c8] bg-[#fafafa] px-10 text-[#121212] outline-none focus:border-[#ff5330] ${type.bodySmall}`

function FieldIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5e5e5e]" aria-hidden="true">
      {children}
    </span>
  )
}

function Inspect() {
  const [activeStep, setActiveStep] = useState(0)
  const step = formSteps[activeStep]
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === formSteps.length - 1

  const goBack = () => setActiveStep((current) => Math.max(0, current - 1))
  const goNext = () => setActiveStep((current) => Math.min(formSteps.length - 1, current + 1))

  return (
    <section id="inspect" className="scroll-mt-[66px]">
      <motion.div
        className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,520px)_minmax(360px,1fr)] lg:gap-20 lg:px-16 lg:py-[112px] xl:gap-[120px] xl:px-20"
        variants={sectionGroup}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div className="mx-auto max-w-[760px] text-center lg:col-span-2" variants={sectionItem}>
          <h2 className={type.sectionTitle}>
            Start your inspection request
          </h2>
          <p className={`mx-auto mt-4 max-w-[620px] text-[#5e5e5e] ${type.body}`}>
            Share the right details in a few short steps so the relief team can review your request.
          </p>
        </motion.div>

        <motion.div
          className="max-w-[520px] mx-auto"
          variants={sectionItem}
        >
          <StepIndicator activeStep={activeStep} />
          <h2 className={type.formTitle}>
            {step.title}
          </h2>
          <p className={`my-[18px] mb-7 text-[#5e5e5e] ${type.bodySmall}`}>
            {step.body}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
            >
              {activeStep === 0 && (
                <div className="grid gap-[18px]">
                  <label className={`grid gap-2 ${type.label}`}>
                    Enter your name
                    <span className="relative block">
                      <FieldIcon>
                        <User size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="text" />
                    </span>
                  </label>
                  <label className={`grid gap-2 ${type.label}`}>
                    Enter your email
                    <span className="relative block">
                      <FieldIcon>
                        <Mail size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="email" placeholder="email@example.com" />
                    </span>
                  </label>
                </div>
              )}

              {activeStep === 1 && (
                <div className="grid gap-[18px]">
                  <span className={`grid gap-2 ${type.label}`}>Service type</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map(({ label, icon: Icon, active }) => (
                      <motion.button
                        className={`${active ? darkButton : outlineButton} whitespace-normal px-3.5`}
                        type="button"
                        key={label}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon size={15} />
                        {label}
                      </motion.button>
                    ))}
                  </div>
                  <label className={`grid gap-2 ${type.label}`}>
                    Your budget
                    <select className={fieldClass} defaultValue="">
                      <option value="" disabled>
                        Select one...
                      </option>
                      <option>$1k - $5k</option>
                      <option>$5k - $10k</option>
                    </select>
                  </label>
                  <label className={`grid gap-2 ${type.label}`}>
                    About the project
                    <span className="relative block">
                      <FieldIcon>
                        <Search size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="text" />
                    </span>
                  </label>
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid gap-[18px]">
                  <label className={`grid gap-2 ${type.label}`}>
                    What is your company name?
                    <span className="relative block">
                      <FieldIcon>
                        <BriefcaseBusiness size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="text" />
                    </span>
                  </label>
                  <span className={`grid gap-2 ${type.label}`}>How many people are you working with?</span>
                  <div className="flex flex-wrap gap-2.5">
                    {['Just me', '1-10', '11-50', '51-100', '101-500'].map((label) => (
                      <motion.button className={`${outlineButton} whitespace-normal px-3.5`} type="button" key={label} whileTap={{ scale: 0.98 }}>
                        <Users size={14} />
                        {label}
                      </motion.button>
                    ))}
                  </div>
                  <label className={`grid gap-2 ${type.label}`}>
                    Website link
                    <span className="relative block">
                      <FieldIcon>
                        <Globe2 size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="url" />
                    </span>
                  </label>
                </div>
              )}

              {activeStep === 3 && (
                <div className="grid gap-[18px]">
                  <label className={`grid gap-2 ${type.label}`}>
                    Country
                    <select className={fieldClass} defaultValue="">
                      <option value="" disabled>
                        Select one...
                      </option>
                      <option>Bangladesh</option>
                      <option>United States</option>
                    </select>
                  </label>
                  <label className={`grid gap-2 ${type.label}`}>
                    Preferred date for chat
                    <span className="relative block">
                      <FieldIcon>
                        <CalendarDays size={16} />
                      </FieldIcon>
                      <input className={fieldClass} type="text" placeholder="dd/mm/yy" />
                    </span>
                  </label>
                </div>
              )}

              {activeStep === 4 && (
                <div className="grid gap-[18px]">
                  <div className="border border-[#c8c8c8] bg-[#f4f4f4] p-4">
                    <div className={`mb-3 flex items-center gap-2 font-extrabold ${type.label}`}>
                      <ClipboardCheck size={16} />
                      Request summary
                    </div>
                    <div className={`grid gap-2 text-[#5e5e5e] ${type.bodySmall}`}>
                      <p className="m-0">Name and email captured for follow-up.</p>
                      <p className="m-0">Service type, company details, and availability are ready for review.</p>
                      <p className="m-0">Submit the request to continue the relief inspection process.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-[26px] flex justify-end gap-3">
            <motion.button className={outlineButton} type="button" onClick={goBack} disabled={isFirstStep} whileTap={{ scale: 0.98 }}>
              Back
            </motion.button>
            <motion.button className={darkButton} type="button" onClick={isLastStep ? undefined : goNext} whileTap={buttonTap}>
              {isLastStep ? 'Submit request' : 'Next'}
            </motion.button>
          </div>
        </motion.div>

        <MediaPlaceholder
          className="mx-auto min-h-[300px] w-full max-w-[630px] sm:min-h-[380px] md:min-h-[430px] lg:min-h-[500px] lg:max-w-none"
          label="Inspect image placeholder"
        />
      </motion.div>
    </section>
  )
}

export default Inspect
