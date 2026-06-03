import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'
import { buildMonitoringSnapshot } from '../../../mocks/seeds.ts'
import {
  formatKg,
  formatKgPerHour,
  formatMinutesToHuman,
  formatPercent,
  formatTemperature,
} from '../../../shared/utils/formatters.ts'

export function MonitoringPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const batches = useAppStore((state) => state.batches)
  const silos = useAppStore((state) => state.silos)

  const batch = useMemo(
    () => batches.find((currentBatch) => currentBatch.id === batchId),
    [batches, batchId],
  )
  const silo = useMemo(
    () => silos.find((currentSilo) => currentSilo.id === batch?.siloId),
    [silos, batch?.siloId],
  )

  const [snapshot, setSnapshot] = useState(
    () => (batch && silo ? buildMonitoringSnapshot(batch, silo) : null),
  )

  useEffect(() => {
    if (!batch || !silo) {
      setSnapshot(null)
      return
    }

    setSnapshot(buildMonitoringSnapshot(batch, silo, new Date()))

    if (batch.status !== 'secando') {
      return
    }

    const timer = window.setInterval(() => {
      setSnapshot(buildMonitoringSnapshot(batch, silo, new Date()))
    }, 4000)

    return () => {
      window.clearInterval(timer)
    }
  }, [batch, silo])

  if (!batch || !silo || !snapshot) {
    return (
      <Card>
        <h3 className="section-title">Monitoramento indisponivel</h3>
        <p className="small-text">Inicie um lote para visualizar os indicadores de secagem.</p>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => navigate('/silos')}>Voltar ao dashboard</Button>
        </div>
      </Card>
    )
  }

  const analysisSteps = [
    {
      title: 'Analise inicial',
      description: 'Realizar apos 20 minutos de secagem.',
    },
    {
      title: 'Analise intermediaria',
      description: 'Conferir amostra no meio do ciclo.',
    },
    {
      title: 'Analise final',
      description: 'Validar antes da finalizacao do lote.',
    },
  ]

  return (
    <>
      <PageHeader
        title="Monitoramento"
        description={`Lote ${batch.numero} em ${silo.codigo} com atualizacao mock a cada 4 segundos.`}
        actions={(
          <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/inicio`)}>
            Voltar para inicio
          </Button>
        )}
      />

      <section className="monitoring-grid">
        <StatCard label="Umidade relativa do ar" value={formatPercent(snapshot.umidadeArPct)} helper="Indicador ambiental" />
        <StatCard
          label="Temperatura"
          value={formatTemperature(snapshot.temperaturaC)}
          helper="Secagem do silo"
          tone={snapshot.temperaturaC >= 42 ? 'warning' : 'default'}
        />
        <StatCard
          label="Tempo estimado"
          value={formatMinutesToHuman(snapshot.tempoEstimadoMin)}
          helper="Previsao operacional"
        />
        <StatCard
          label="Status da secagem"
          value={snapshot.statusSecagem}
          helper="Faixa de operacao"
          tone={snapshot.statusSecagem === 'Critico' ? 'danger' : snapshot.statusSecagem === 'Atencao' ? 'warning' : 'success'}
        />
      </section>

      <Card>
        <h3 className="section-title">Consumo de Gas</h3>
        <div className="data-list" style={{ marginTop: 10 }}>
          <div className="data-row">
            <span>Consumo atual</span>
            <strong>{formatKgPerHour(snapshot.gasKgPorHora)}</strong>
          </div>
          <div className="data-row">
            <span>Consumo acumulado</span>
            <strong>{formatKg(snapshot.gasAcumuladoKg)}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Alertas de analise (mock)</h3>
        <p className="small-text" style={{ marginTop: 8 }}>
          Funcionalidade avancada de registro sera implementada na proxima etapa.
        </p>
        <div className="alert-list" style={{ marginTop: 12 }}>
          {analysisSteps.map((step) => (
            <article className="alert-item" key={step.title}>
              <strong>{step.title}</strong>
              <p className="small-text" style={{ marginTop: 4 }}>{step.description}</p>
            </article>
          ))}
        </div>
      </Card>
    </>
  )
}

