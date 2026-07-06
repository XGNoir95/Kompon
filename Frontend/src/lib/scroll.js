export function scrollToSectionStart(target, behavior = 'smooth') {
  const section = document.getElementById(target)

  if (!section) {
    return
  }

  const navHeight = document.querySelector('header')?.offsetHeight ?? 0
  const sectionTop = section.getBoundingClientRect().top + window.scrollY

  window.scrollTo({
    top: Math.max(0, sectionTop - navHeight),
    behavior,
  })
}
