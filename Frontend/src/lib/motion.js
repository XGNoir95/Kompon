export const sectionViewport = {
  once: true,
}

export const sectionGroup = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0,
      when: 'beforeChildren',
      delayChildren: 0,
      staggerChildren: 0,
    },
  },
}

export const sectionItem = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
}

export const buttonTap = {
  scale: 0.98,
}

export const buttonHover = {
  y: -2,
}
