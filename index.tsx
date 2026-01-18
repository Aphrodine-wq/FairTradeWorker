import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './src/hooks/useAuth';
import { CustomizationProvider } from './src/hooks/useCustomization';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CustomizationProvider>
        <App />
      </CustomizationProvider>
    </AuthProvider>
  </React.StrictMode>
);