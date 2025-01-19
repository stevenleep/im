import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Buffer } from 'buffer'

// Fix for simple-peer in browser environment
window.global = window;
window.Buffer = Buffer;
window.process = {
  env: { DEBUG: undefined },
  nextTick: function(fn: Function) { setTimeout(fn, 0); },
  version: ''
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)