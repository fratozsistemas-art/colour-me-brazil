import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker } from './lib/registerServiceWorker'
import { BrowserRouter } from 'react-router-dom'
import { validateEnv } from '@/lib/env'
import { initAnalytics } from '@/lib/analytics'
import { configureConsole } from '@/lib/console'

// Register service worker for offline functionality and PWA support
configureConsole();
validateEnv();
registerServiceWorker();
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}
