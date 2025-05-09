import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const supabase = createClient(
  'https://pgvwidupxkvxsvugnohf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndndpZHVweGt2eHN2dWdub2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODM0MjUsImV4cCI6MjA2MTE1OTQyNX0.ltudYC-4wByekqwK5fZ6hhbGQrWH2SBjQmf5tXCaI8E'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);
