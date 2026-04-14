import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// StrictMode is intentionally removed — it causes Supabase auth lock conflicts
// (AbortError: Lock broken by another request with the 'steal' option)
// Safe to add back once Supabase JS v3 ships with a fix
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
