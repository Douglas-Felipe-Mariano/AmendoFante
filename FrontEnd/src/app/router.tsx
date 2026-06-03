import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import type { UserRole } from '../domains/auth/model.ts'
import { LoginPage } from '../domains/auth/pages/LoginPage.tsx'
import { ProfilePage } from '../domains/auth/pages/ProfilePage.tsx'
import { BatchCreatePage } from '../domains/batches/pages/BatchCreatePage.tsx'
import { BatchStartPage } from '../domains/batches/pages/BatchStartPage.tsx'
import { MonitoringPage } from '../domains/batches/pages/MonitoringPage.tsx'
import { ManagerHomePage } from '../domains/manager/pages/ManagerHomePage.tsx'
import { SiloFormPage } from '../domains/silos/pages/SiloFormPage.tsx'
import { SilosDashboardPage } from '../domains/silos/pages/SilosDashboardPage.tsx'
import { AppShell } from '../design-system/components/AppShell.tsx'
import { useAppStore } from './store.ts'

function RequireAuth() {
  const isAuthenticated = useAppStore((state) => state.session.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function RequireRole({ role }: { role: UserRole }) {
  const activeRole = useAppStore((state) => state.session.role)

  if (activeRole !== role) {
    return <Navigate to="/silos" replace />
  }

  return <Outlet />
}

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function NotFoundPage() {
  const isAuthenticated = useAppStore((state) => state.session.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/silos' : '/login'} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/perfil" element={<ProfilePage />} />

          <Route element={<ShellLayout />}>
            <Route path="/silos" element={<SilosDashboardPage />} />
            <Route path="/silos/novo" element={<SiloFormPage />} />
            <Route path="/silos/:siloId/editar" element={<SiloFormPage />} />

            <Route path="/lotes/novo" element={<BatchCreatePage />} />
            <Route path="/lotes/:batchId/inicio" element={<BatchStartPage />} />
            <Route path="/lotes/:batchId/monitoramento" element={<MonitoringPage />} />

            <Route element={<RequireRole role="gestor" />}>
              <Route path="/gerencial" element={<ManagerHomePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

