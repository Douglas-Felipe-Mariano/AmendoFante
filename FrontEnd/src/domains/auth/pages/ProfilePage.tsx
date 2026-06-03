import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'

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
      <Card className="auth-card" padded={false}>
        <div className="auth-brand">
          <img className="auth-logo" src="/logo-amendofante.png" alt="AmendoFante" />
          <div>
            <h1 className="brand-title">Selecionar Perfil</h1>
            <p className="brand-subtitle">Defina como deseja navegar no prototipo desta sessao.</p>
          </div>
        </div>

        <div className="profile-grid">
          <article className="choice-card">
            <h3>Operador de Silo</h3>
            <p>Fluxo operacional completo: silos, lote, inicio de secagem e monitoramento.</p>
            <Button onClick={handleChooseOperator}>Entrar como Operador</Button>
          </article>

          <article className="choice-card">
            <h3>Gestor</h3>
            <p>Visao inicial gerencial para acompanhamento, sem funcoes avancadas nesta etapa.</p>
            <Button variant="secondary" onClick={handleChooseManager}>
              Entrar como Gestor
            </Button>
          </article>
        </div>
      </Card>
    </section>
  )
}

