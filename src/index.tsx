import React from 'react'
import { render } from 'react-dom'

// Atomic react root
;(function bootstrap(anchorElement: HTMLElement | null): void {
  if (anchorElement) {
    render(<div>Hello World!</div>, anchorElement)
  } else {
    console.error('No anchor element provided')
  }
})(document.getElementById('anchor'))
