import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/global.css'
import { applyTheme, getTheme } from './utils/theme'

applyTheme(getTheme())

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
