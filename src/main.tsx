import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner.tsx';
import { ThemeProvider, useTheme } from './components/Common/Themes/theme-provider.tsx';
import store from './redux/store/store.ts';
import router from './router/routes.tsx';
import { RouterProvider } from 'react-router';


// Include Global Error Handler For Queries ( Mutation will be handled manually )
const queryClient = new QueryClient(({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error?.message || "An error occured")
    }
  })
}));

// Toast Wrapper
function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster richColors position="top-right" theme={theme === "system" ? "system" : theme} />
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    {/* <ThemeProvider> */}
      <StrictMode>
          <Provider store={store}>
            <RouterProvider router={router} />  
            <ThemedToaster />
          </Provider>
      </StrictMode>
    {/* </ThemeProvider> */}
  </QueryClientProvider>
);
