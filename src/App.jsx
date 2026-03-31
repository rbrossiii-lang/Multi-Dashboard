import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Layout       from '@/components/layout/Layout'
import Overview     from '@/pages/Overview'
import Markets      from '@/pages/Markets'
import MarketDetail from '@/pages/MarketDetail'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
      staleTime:          1000 * 60 * 60, // 1 hour default
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index                       element={<Overview />} />
            <Route path="markets"              element={<Markets />} />
            <Route path="markets/:marketSlug"  element={<MarketDetail />} />
            <Route path="*"                    element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  )
}
