import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="dark">
      <AuthProvider>
        <CartProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </CartProvider>
      </AuthProvider>
    </div>
  </StrictMode>,
)
