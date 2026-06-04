import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'

export function ProfilePage() {
  const navigate = useNavigate()
  const chooseRole = useAppStore((state) => state.chooseRole)

  const handleChooseOperator = () => {
    chooseRole('operador')
    navigate('/silos')
  }

  const handleChooseManager = () => {
    chooseRole('gestor')
    navigate('/gerencial')
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <img className="auth-logo" src="/logo-amendofante.png" alt="AmendoFante" />
          <div>
            <h1 className="brand-title">Selecionar Perfil</h1>
            <p className="brand-subtitle">Defina como deseja navegar na plataforma nesta sessao.</p>
          </div>
        </div>

        <div className="profile-cards">
          <article className="profile-card operator">
            <span className="profile-icon">OP</span>
            <h3>Operador de Silo</h3>
            <p>Fluxo operacional completo com cadastro de lote, monitoramento e finalizacao.</p>
            <Button onClick={handleChooseOperator}>Entrar como Operador</Button>
          </article>

          <article className="profile-card manager">
            <span className="profile-icon">GE</span>
            <h3>Gestor</h3>
            <p>Painel gerencial para historico, indicadores de performance e drilldown de lotes.</p>
            <Button variant="secondary" onClick={handleChooseManager}>
              Entrar como Gestor
            </Button>
          </article>
        </div>
      </div>
    </section>
  )
}

