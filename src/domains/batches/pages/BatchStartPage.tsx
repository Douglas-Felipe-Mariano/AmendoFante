import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Badge } from '../../../design-system/components/Badge.tsx'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { formatDateIso, formatPercent } from '../../../shared/utils/formatters.ts'

function getStatusVariant(status: string) {
  if (status === 'secando') {
    return 'success'
  }

  if (status === 'cadastrado') {
    return 'info'
  }

  if (status === 'pausado') {
    return 'warning'
  }

  if (status === 'aguardando_analise') {
    return 'danger'
  }

  return 'default'
}

export function BatchStartPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const batches = useAppStore((state) => state.batches)
  const silos = useAppStore((state) => state.silos)
  const startBatch = useAppStore((state) => state.startBatch)
  const setActiveBatch = useAppStore((state) => state.setActiveBatch)

  const batch = useMemo(
    () => batches.find((currentBatch) => currentBatch.id === batchId),
    [batches, batchId],
  )
  const silo = useMemo(
    () => silos.find((currentSilo) => currentSilo.id === batch?.siloId),
    [silos, batch?.siloId],
  )

  if (!batch || !silo) {
    return (
      <Card>
        <h3 className="section-title">Lote nao encontrado</h3>
        <p className="small-text">Selecione um lote valido para iniciar secagem.</p>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigate('/lotes/novo')}>Voltar para cadastro</Button>
        </div>
      </Card>
    )
  }

  const handleStart = () => {
    startBatch(batch.id)
    setActiveBatch(batch.id)
  }

  return (
    <>
      <PageHeader
        title="Inicio da Secagem"
        description="Confirme os dados do lote e inicie o processo operacional."
      />

      <Card>
        <div className="data-list">
          <div className="data-row">
            <span>Lote</span>
            <strong>{batch.numero}</strong>
          </div>
          <div className="data-row">
            <span>Operador</span>
            <strong>{batch.operador}</strong>
          </div>
          <div className="data-row">
            <span>Silo</span>
            <strong>{`${silo.codigo} - ${silo.nome}`}</strong>
          </div>
          <div className="data-row">
            <span>Data</span>
            <strong>{formatDateIso(batch.data)}</strong>
          </div>
          <div className="data-row">
            <span>Umidade de chegada</span>
            <strong>{formatPercent(batch.umidadeChegadaPct)}</strong>
          </div>
          <div className="data-row">
            <span>Umidade relativa do ar (silo)</span>
            <strong>{formatPercent(silo.umidadeRelativaPct)}</strong>
          </div>
          <div className="data-row">
            <span>Umidade do amendoim (silo)</span>
            <strong>{formatPercent(silo.umidadeAmendoimPct)}</strong>
          </div>
          <div className="data-row">
            <span>Status</span>
            <Badge variant={getStatusVariant(batch.status)}>{batch.status}</Badge>
          </div>
        </div>

        <div className="inline-actions" style={{ marginTop: 16 }}>
          <Button onClick={handleStart} disabled={batch.status === 'secando' || batch.status === 'finalizado'}>
            {batch.status === 'secando' || batch.status === 'finalizado' ? 'Secagem ja iniciada' : 'Iniciar secagem'}
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/monitoramento`)}>
            Ir para monitoramento
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/lotes/${batch.id}/analises`)}>
            Ir para analises
          </Button>
        </div>
      </Card>
    </>
  )
}

