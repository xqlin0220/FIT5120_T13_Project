// src/components/ResultsDrawer/useGlobalTooltip.js
import { reactive, nextTick } from 'vue'

// Gap between tooltip and target element in pixels
const GAP = 12

export function useGlobalTooltip() {
  // Reactive state for the tooltip
  const tip = reactive({
    show: false,       
    text: '',          
    color: 'green',    
    side: 'left',      
    top: 0,            
    left: 0,           
  })

  /**
   * Determine which side (left/right) the tooltip should appear on
   * @param {DOMRect} rect - Bounding rectangle of target element
   * @param {number} estWidth - Estimated tooltip width in pixels
   * @returns {'left' | 'right'}
   */
  function computeSide(rect, estWidth = 320) {
    const hasLeft = rect.left > (estWidth + GAP + 16)
    return hasLeft ? 'left' : 'right'
  }

  /**
   * Open the tooltip relative to a given DOM element
   * @param {Object} options
   * @param {HTMLElement} options.el - Target element
   * @param {string} options.text - Tooltip text
   * @param {'green'|'yellow'|'red'|'grey'} options.color - Tooltip color
   */
  async function openFromEl({ el, text, color }) {
    if (!el) return
    // Update tooltip content and appearance
    tip.text = text
    tip.color = color
    tip.side = computeSide(el.getBoundingClientRect())
    tip.show = true
    await nextTick() // Wait for tooltip to render

    const tipEl = document.getElementById('global-green-tip')
    if (!tipEl) return

    // Calculate position
    const rect = el.getBoundingClientRect()
    const tRect = tipEl.getBoundingClientRect()
    const padding = 8

    // Center tooltip vertically with target element
    let top = rect.top + rect.height / 2 - tRect.height / 2
    const maxTop = window.innerHeight - tRect.height - padding

    // Constrain tooltip within viewport
    tip.top = Math.min(Math.max(padding, top), Math.max(padding, maxTop))
    tip.left = tip.side === 'left'
      ? rect.left - tRect.width - GAP
      : rect.right + GAP
  }

  /** Close the tooltip */
  function close() { tip.show = false }

  /** Toggle tooltip visibility relative to a given element */
  function toggleFromEl(args) { tip.show ? close() : openFromEl(args) }

  /**
   * Bind global event listeners to handle tooltip closing
   * Returns a cleanup function to remove the listeners
   */
  function bindGlobalListeners() {
    
    const onDocClick = (e) => {
      if (e.target.closest('.teleport-tip') || e.target.closest('.has-tip')) return
      close()
    }

    const onScrollOrResize = () => { if (tip.show) close() }

    const onKeydown = (e) => { if (e.key === 'Escape') close() }

    document.addEventListener('click', onDocClick)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    document.addEventListener('keydown', onKeydown)

    // Return cleanup function
    return () => {
      document.removeEventListener('click', onDocClick)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      document.removeEventListener('keydown', onKeydown)
    }
  }

  // Expose tooltip state and control methods
  return { tip, openFromEl, toggleFromEl, close, bindGlobalListeners }
}
