import { motion } from 'framer-motion'
import { AtSign, Link, MessageCircle, Share2, Video } from 'lucide-react'
import { buttonHover, buttonTap, sectionGroup, sectionItem, sectionViewport } from '../lib/motion.js'
import { type } from '../lib/typography.js'

const footerLinks = [
  'Link One',
  'Link Two',
  'Link Three',
  'Link Four',
  'Link Five',
]

const socials = [Share2, MessageCircle, AtSign, Link, Video]
const legalIcons = [Share2, MessageCircle, AtSign, Video]
const buttonBase = `inline-flex min-h-11 items-center justify-center border px-5 ${type.button}`

function Footer() {
  return (
    <footer className="bg-[#121212] text-white">
      <motion.div
        className="mx-auto grid w-full max-w-[710px] gap-10 px-5 pb-12 pt-14 sm:px-8 sm:py-16 md:px-10 lg:max-w-[1440px] lg:grid-cols-[minmax(0,560px)_minmax(280px,1fr)] lg:gap-28 lg:px-16 lg:pb-16 lg:pt-20 xl:gap-40 xl:px-20"
        variants={sectionGroup}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div
          variants={sectionItem}
        >
          <h2 className={type.sectionTitle}>
            Medium length footer heading goes here
          </h2>
          <p className={`my-[22px] text-[#c8c8c8] md:mb-7 ${type.body}`}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique.
          </p>
          <div className="flex gap-3.5">
            <motion.button className={`${buttonBase} border-[#ff5330] bg-[#ff5330] text-white`} type="button" whileHover={buttonHover} whileTap={buttonTap}>
              Button
            </motion.button>
            <motion.button className={`${buttonBase} border-white bg-transparent text-white`} type="button" whileHover={buttonHover} whileTap={buttonTap}>
              Button
            </motion.button>
          </div>
        </motion.div>

        <motion.div className={`grid gap-8 sm:grid-cols-2 md:gap-14 ${type.footerLink}`} aria-label="Footer links" variants={sectionItem}>
          <ul className="grid gap-[18px] p-0">
            {footerLinks.map((link) => (
              <li className="list-none" key={`left-${link}`}>
                <a className="transition-colors hover:text-[#ff5330]" href="#home">{link}</a>
              </li>
            ))}
          </ul>
          <ul className="grid gap-[18px] p-0">
            {footerLinks.map((link) => (
              <li className="list-none" key={`right-${link}`}>
                <a className="transition-colors hover:text-[#ff5330]" href="#home">{link}</a>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-[710px] flex-col items-start gap-5 px-5 pb-8 sm:px-8 md:flex-row md:items-center md:justify-between md:px-10 lg:max-w-[1440px] lg:px-16 xl:px-20">
        <span className={type.navBrand}>Kompon</span>
        <div className="flex gap-2" aria-label="Social links">
          {socials.map((Icon, index) => (
            <motion.a
              className="grid h-7 w-7 place-items-center rounded-full bg-[#222] text-[#c8c8c8]"
              href="#home"
              key={index}
              aria-label={`Social link ${index + 1}`}
              whileHover={{ y: -2, backgroundColor: '#ff5330', color: '#ffffff' }}
            >
              <Icon size={14} />
            </motion.a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-[calc(100%-40px)] max-w-[660px] flex-col items-start gap-5 border-t border-[#2b2b2b] py-7 sm:w-[calc(100%-64px)] md:flex-row md:items-center md:justify-between lg:max-w-[1280px]">
        <small className={`text-[#c8c8c8] ${type.legal}`}>(c) 2026 Kompon. All rights reserved.</small>
        <div className="flex gap-4" aria-hidden="true">
          {legalIcons.map((Icon, index) => (
            <Icon className="h-3.5 w-3.5 text-[#c8c8c8]" key={index} />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
