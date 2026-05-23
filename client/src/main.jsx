import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pesos 400 (regular) e 600 (semibold) apenas — regra do design system (CLAUDE.md 7.3).
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

import './styles/tokens.css';
import './styles/global.css';

import App from './App.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
