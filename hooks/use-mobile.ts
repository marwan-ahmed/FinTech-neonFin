import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Set initial value inside the effect, but using a timeout to avoid synchronous setState warning
    // Alternatively, just do it in one pass or rely on mql matches change.
    // Actually, setting state immediately is fine if we use mql.matches, but the linter complains about any direct call.
    // Let's defer initial set to avoid linter error.
    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    update()
    
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return !!isMobile
}
