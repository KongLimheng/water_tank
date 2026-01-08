import { QueryClient } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Could not find root element to mount to')
}

const root = ReactDOM.createRoot(rootElement)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent re-fetching when clicking between windows
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
})
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
