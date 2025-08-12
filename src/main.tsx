import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import store from "./store/store.ts";
import { Provider } from 'react-redux'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      
      staleTime: 2 * 24 * 60 * 60 * 1000, 
    },
  },
});

createRoot(document.getElementById("root")!).render(
  
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
         <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App/>
        </Provider>
        </QueryClientProvider>
        
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
  
);
