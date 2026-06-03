import { useNavigate } from 'react-router-dom'

import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'

export function ManagerHomePage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Painel Gerencial"
        description="Placeholder da visao de gestao. Implementacao completa ficara para etapa futura."
      />

      <Card>
        <h3 className="section-title">Escopo atual</h3>
        <p className="small-text" style={{ marginTop: 8 }}>
          As Etapas 1 e 2 priorizam o fluxo do operador. Este painel foi incluido para manter
          a navegacao por perfil sem quebrar a aplicacao.
        </p>

        <div className="inline-actions" style={{ marginTop: 14 }}>
          <Button onClick={() => navigate('/silos')}>Ir para dashboard operacional</Button>
        </div>
      </Card>
    </>
  )
}

