import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp } from 'antd';
import App from './App';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';

// Configuration de dayjs en français
dayjs.locale('fr');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AntApp>
      <App />
    </AntApp>
  </React.StrictMode>
);
