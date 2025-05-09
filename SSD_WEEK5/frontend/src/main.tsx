import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SupabaseProvider } from './lib/supabase-context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseProvider>
      <App />
    </SupabaseProvider>
  </React.StrictMode>
);
