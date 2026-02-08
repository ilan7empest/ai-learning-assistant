import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast";

import App from './App.tsx'
import { AuthProvider } from './context/Auth.context.tsx'

import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position='top-right' toastOptions={{ duration: 3000 }} />
      <App />
    </AuthProvider>
  </StrictMode>,
)
