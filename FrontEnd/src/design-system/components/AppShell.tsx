import type { ReactNode } from 'react'

import { NavLink, useNavigate } from 'react-router-dom'

import { useAppStore } from '../../app/store.ts'
import { cn } from '../../shared/utils/cn.ts'
import { Button } from './Button.tsx'

interface NavigationItem {
  label: string
  to?: string
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const role = useAppStore((state) => state.session.role)
  const userName = useAppStore((state) => state.session.userName)
  const activeBatchId = useAppStore((state) => state.activeBatchId)
  const logout = useAppStore((state) => state.logout)

  const operatorItems: NavigationItem[] = [
    { label: 'Dashboard de Silos', to: '/silos' },
    { label: 'Cadastro de Lote', to: '/lotes/novo' },
    {
      label: 'Inicio de Secagem',
      to: activeBatchId ? `/lotes/${activeBatchId}/inicio` : undefined,
    },
    {
      label: 'Monitoramento',
      to: activeBatchId ? `/lotes/${activeBatchId}/monitoramento` : undefined,
    },
    {
      label: 'Analises',
      to: activeBatchId ? `/lotes/${activeBatchId}/analises` : undefined,
    },
    {
      label: 'Finalizacao',
      to: activeBatchId ? `/lotes/${activeBatchId}/finalizacao` : undefined,
    },
    {
      label: 'Resumo do Lote',
      to: activeBatchId ? `/lotes/${activeBatchId}/resumo` : undefined,
    },
    { label: 'Historico', to: '/historico' },
  ]

  const managerItems: NavigationItem[] = [
    { label: 'Painel Gerencial', to: '/gerencial' },
    { label: 'Historico', to: '/historico' },
    { label: 'Dashboard de Silos', to: '/silos' },
  ]

  const navItems = role === 'gestor' ? managerItems : operatorItems
  const mobileItems = navItems.slice(0, 4)

  const nowLabel = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date())

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
        <div className="brand-block">
          <img src="/logo-amendofante.png" alt="AmendoFante" />
          <div>
            <strong>AmendoFante</strong>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Prototipo IoT</div>
          </div>
        </div>

        <div className="shell-nav">
          {navItems.map((item) => {
            if (!item.to) {
              return (
                <span
                  key={item.label}
                  className="shell-link shell-link-disabled"
                  title="Crie um lote para liberar esta etapa"
                >
                  {item.label}
                </span>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => cn('shell-link', isActive && 'shell-link-active')}
              >
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div>
            <div style={{ fontWeight: 700 }}>{userName || 'Operador'}</div>
            <div className="shell-header-time">{nowLabel}</div>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>

        <section className="content">{children}</section>

        <nav className="bottom-nav">
          {mobileItems.map((item) => {
            if (!item.to) {
              return (
                <span key={item.label} className="bottom-link shell-link-disabled">
                  {item.label}
                </span>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => cn('bottom-link', isActive && 'bottom-link-active')}
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

