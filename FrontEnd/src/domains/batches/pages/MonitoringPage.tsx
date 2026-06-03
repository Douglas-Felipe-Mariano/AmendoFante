import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Badge } from '../../../design-system/components/Badge.tsx'
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
  const analysisAlerts = useAppStore((state) => state.analysisAlerts)
  const analysisRecords = useAppStore((state) => state.analysisRecords)
  const refreshBatchAlerts = useAppStore((state) => state.refreshBatchAlerts)

  const batch = useMemo(
    () => batches.find((currentBatch) => currentBatch.id === batchId),
    [batches, batchId],
  )
  const silo = useMemo(
    () => silos.find((currentSilo) => currentSilo.id === batch?.siloId),
    [silos, batch?.siloId],
  )

  const [currentTime, setCurrentTime] = useState(() => new Date())

  const snapshot = useMemo(
    () => (batch && silo ? buildMonitoringSnapshot(batch, silo, currentTime) : null),
    [batch, silo, currentTime],
  )
  const monitoredBatchId = batch?.id ?? null
  const elapsedMinutes = snapshot?.elapsedMinutes ?? null

  useEffect(() => {
    if (!batch || !silo || batch.status !== 'secando') {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 4000)

    return () => {
      window.clearInterval(timer)
    }
  }, [batch, silo])

  useEffect(() => {
    if (!monitoredBatchId || elapsedMinutes === null) {
      return
    }

    refreshBatchAlerts(monitoredBatchId, elapsedMinutes)
  }, [monitoredBatchId, elapsedMinutes, refreshBatchAlerts])

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

  const batchAlerts = analysisAlerts
    .filter((alert) => alert.batchId === batch.id)
    .sort((a, b) => a.dueMinutes - b.dueMinutes)

  const batchRecords = analysisRecords.filter((record) => record.batchId === batch.id)
  const overdueCount = batchAlerts.filter((alert) => alert.status === 'atrasado').length
  const progressPct = Math.min(100, Math.round((snapshot.elapsedMinutes / Math.max(1, snapshot.tempoEstimadoMin)) * 100))

  const getAlertVariant = (status: 'pendente' | 'realizado' | 'atrasado') => {
    if (status === 'realizado') {
      return 'success'
    }

    if (status === 'atrasado') {
      return 'danger'
    }

    return 'warning'
  }

  return (
    <>
      <PageHeader
        title="Monitoramento"
        description={`Lote ${batch.numero} em ${silo.codigo} com atualizacao mock a cada 4 segundos.`}
        contextLabel="Tempo real"
        actions={(
          <>
            <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/inicio`)}>
              Voltar para inicio
            </Button>
            <Button onClick={() => navigate(`/lotes/${batch.id}/analises`)}>
              Ir para analises
            </Button>
          </>
        )}
      />

      <Card className="process-rail-card">
        <div className="process-rail-header">
          <strong>Progresso estimado da secagem</strong>
          <span>{progressPct}%</span>
        </div>
        <div className="process-rail-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
          <span className="process-rail-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="inline-actions" style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <span className="small-text">Tempo decorrido: {formatMinutesToHuman(snapshot.elapsedMinutes)}</span>
          <span className="small-text">Meta: {formatMinutesToHuman(snapshot.tempoEstimadoMin)}</span>
        </div>
      </Card>

      <section className="monitoring-grid">
        <StatCard label="Umidade relativa do ar" value={formatPercent(snapshot.umidadeArPct)} helper="Indicador ambiental" />
        <StatCard
          label="Umidade do amendoim"
          value={formatPercent(snapshot.umidadeAmendoimPct)}
          helper="Umidade interna do silo"
          tone={snapshot.umidadeAmendoimPct >= 15 ? 'warning' : 'default'}
        />
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
        <StatCard
          label="Alertas atrasados"
          value={String(overdueCount)}
          helper="Pendencias de analise"
          tone={overdueCount > 0 ? 'danger' : 'success'}
        />
      </section>

      <Card>
        <h3 className="section-title">Consumo de Gas (KG)</h3>
        <div className="data-list" style={{ marginTop: 10 }}>
          <div className="data-row">
            <span>Consumo acumulado do secador</span>
            <strong>{formatKg(snapshot.gasAcumuladoKg)}</strong>
          </div>
          <div className="data-row">
            <span>Taxa atual (referencia tecnica)</span>
            <strong>{formatKgPerHour(snapshot.gasKgPorHora)}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Agenda de analises</h3>
        <p className="small-text" style={{ marginTop: 8 }}>
          Registros realizados: {batchRecords.length}
        </p>
        <div className="alert-list" style={{ marginTop: 12 }}>
          {batchAlerts.map((alert) => (
            <article className="alert-item" key={alert.id}>
              <div className="inline-actions" style={{ justifyContent: 'space-between', width: '100%' }}>
                <strong>Analise {alert.type}</strong>
                <Badge variant={getAlertVariant(alert.status)}>{alert.status}</Badge>
              </div>
              <p className="small-text" style={{ marginTop: 4 }}>
                Janela prevista: {alert.dueMinutes} min de secagem.
              </p>
            </article>
          ))}
        </div>
        <div className="inline-actions" style={{ marginTop: 14 }}>
          <Button onClick={() => navigate(`/lotes/${batch.id}/analises`)}>Registrar analises</Button>
          <Button variant="secondary" onClick={() => navigate(`/lotes/${batch.id}/finalizacao`)}>
            Ir para finalizacao
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/lotes/${batch.id}/resumo`)}>
            Ver resumo
          </Button>
        </div>
      </Card>
    </>
  )
}

