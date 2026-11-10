import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './app/App';
import { setupI18n } from './i18n';
import { startRealtime } from './lib/realtime';
import { isFileProtocol } from './lib/env';

async function bootstrap() {
  await setupI18n();
  startRealtime();
  // Electron tải bản build qua file:// → dùng HashRouter (đường dẫn thật không tồn tại trên đĩa).
  const Router = isFileProtocol() ? HashRouter : BrowserRouter;
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>,
  );
}

void bootstrap();
