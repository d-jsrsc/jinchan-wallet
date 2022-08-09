import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
// import reportWebVitals from './reportWebVitals';

// import { WalletProvider } from './provider/WalletProvider';
// import { ConnectionProvider } from './provider/ConnectionProvider';
import { isExtension } from './utils';
import { AppProvider } from './AppProvider';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import WalletApp from './apps/WalletApp';

console.log({ isExtension });
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
isExtension
  ? root.render(
      <React.StrictMode>
        <MemoryRouter>
          <AppProvider>
            <WalletApp />
          </AppProvider>
        </MemoryRouter>
      </React.StrictMode>
    )
  : root.render(
      <React.StrictMode>
        <BrowserRouter>
          <AppProvider>
            <WalletApp />
          </AppProvider>
        </BrowserRouter>
      </React.StrictMode>
    );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
