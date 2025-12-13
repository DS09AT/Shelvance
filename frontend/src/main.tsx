import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { Providers } from '@/shared/lib/Providers';

import { App } from './App';

import './styles/tailwind.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
