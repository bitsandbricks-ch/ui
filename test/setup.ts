import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

// jsdom has no layout: Mantine asks for these.
const { getComputedStyle } = window
window.getComputedStyle = (elt) => getComputedStyle(elt)
window.HTMLElement.prototype.scrollIntoView = () => {}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }),
})
class ResizeObserver { observe() {} unobserve() {} disconnect() {} }
window.ResizeObserver = ResizeObserver
