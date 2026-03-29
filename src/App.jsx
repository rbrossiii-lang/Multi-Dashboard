import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Layout          from '@/components/layout/Layout'
import Overview        from '@/pages/Overview'
import MacroIndicators from '@/pages/MacroIndicators'
import MetroAnalysis   from '@/pages/MetroAnalysis'
import MarketIntel     from '@/pages/MarketIntel'
import Portfolio       from '@/pages/Portfolio'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              2,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index                  element={<Overview />} />
            <Route path="macro"           element={<MacroIndicators />} />
            <Route path="metro"           element={<MetroAnalysis />} />
            <Route path="metro/:metroId"  element={<MetroAnalysis />} />
            <Route path="market-intel"    element={<MarketIntel />} />
            <Route path="portfolio"       element={<Portfolio />} />
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
