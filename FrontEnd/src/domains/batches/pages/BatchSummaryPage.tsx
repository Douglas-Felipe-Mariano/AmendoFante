import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'
import {
  formatCurrencyBRL,
  formatKg,
  formatKgPerHour,
  formatMinutesToHuman,
  formatPercent,
} from '../../../shared/utils/formatters.ts'

interface BatchSummaryPageProps {
  managerMode?: boolean
}

export function BatchSummaryPage({ managerMode = false }: BatchSummaryPageProps) {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()

  const batches = useAppStore((state) => state.batches)
  const silos = useAppStore((state) => state.silos)
  const analysisRecords = useAppStore((state) => state.analysisRecords)
  const timeline = useAppStore((state) => state.timeline)
  const consumptions = useAppStore((state) => state.consumptions)
  const costs = useAppStore((state) => state.costs)

  const batch = useMemo(
    () => batches.find((item) => item.id === batchId),
    [batches, batchId],
  )

  const silo = useMemo(
    () => silos.find((item) => item.id === batch?.siloId),
    [silos, batch?.siloId],
  )

  const records = useMemo(
    () => analysisRecords.filter((item) => item.batchId === batchId),
    [analysisRecords, batchId],
  )

  const timelineItems = useMemo(
    () => timeline
      .filter((item) => item.batchId === batchId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [timeline, batchId],
  )

  const consumption = useMemo(
    () => consumptions.find((item) => item.batchId === batchId),
    [consumptions, batchId],
  )

  const cost = useMemo(
    () => costs.find((item) => item.batchId === batchId),
    [costs, batchId],
  )

  if (!batch || !silo) {
    return (
      <Card>
        <h3 className="section-title">Resumo indisponivel</h3>
        <p className="small-text">Lote nao encontrado na base atual.</p>
      </Card>
    )
  }

  const reductionPct = typeof batch.umidadeFinalPct === 'number'
    ? batch.umidadeChegadaPct - batch.umidadeFinalPct
    : 0

  const backPath = managerMode ? '/gerencial' : '/historico'

  return (
    <>
      <PageHeader
        title={`Resumo do lote ${batch.numero}`}
        description="Visao consolidada de indicadores, consumo, custos e eventos do processo."
        contextLabel={managerMode ? 'Drilldown' : 'Operacional'}
        actions={(
          <Button variant="secondary" onClick={() => navigate(backPath)}>
            Voltar
          </Button>
        )}
      />

      <section className="stat-grid">
        <StatCard label="Status" value={batch.status} helper="Estado atual do ciclo" tone={batch.status === 'finalizado' ? 'success' : 'warning'} />
        <StatCard label="Umidade chegada" value={formatPercent(batch.umidadeChegadaPct)} />
        <StatCard label="Umidade final" value={typeof batch.umidadeFinalPct === 'number' ? formatPercent(batch.umidadeFinalPct) : '-'} />
        <StatCard label="Reducao de umidade" value={typeof batch.umidadeFinalPct === 'number' ? formatPercent(reductionPct) : '-'} />
        <StatCard label="Tempo total" value={batch.tempoTotalMin ? formatMinutesToHuman(batch.tempoTotalMin) : '-'} />
      </section>

      <Card>
        <h3 className="section-title">Dados gerais</h3>
        <div className="data-list" style={{ marginTop: 10 }}>
          <div className="data-row">
            <span>Operador</span>
            <strong>{batch.operador}</strong>
          </div>
          <div className="data-row">
            <span>Silo</span>
            <strong>{`${silo.codigo} - ${silo.nome}`}</strong>
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
            <span>Observacoes</span>
            <strong>{batch.observacoes || '-'}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">Consumo e custos</h3>
        {!consumption || !cost ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            O lote ainda nao possui consumo/custo consolidado. Finalize para gerar os dados.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Gas acumulado (KG)</th>
                  <th>Taxa media (KG/h)</th>
                  <th>Energia</th>
                  <th>Custo total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatKg(consumption.gasKg)}</td>
                  <td>{formatKgPerHour(consumption.gasKgPorHora)}</td>
                  <td>{consumption.energiaKwh.toFixed(1)} kWh</td>
                  <td>{formatCurrencyBRL(cost.custoTotal)}</td>
                </tr>
              </tbody>
            </table>
            <div className="inline-actions" style={{ marginTop: 10 }}>
              <span className="small-text">Gas: {formatCurrencyBRL(cost.custoGas)}</span>
              <span className="small-text">Energia: {formatCurrencyBRL(cost.custoEnergia)}</span>
              <span className="small-text">Operacao: {formatCurrencyBRL(cost.custoOperacao)}</span>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="section-title">Analises registradas</h3>
        {records.length === 0 ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            Nenhuma analise registrada para este lote.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Tipo</th>
                  <th>Resultado</th>
                  <th>Operador</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.createdAt))}</td>
                    <td>{record.alertType}</td>
                    <td>{record.resultado}</td>
                    <td>{record.operador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="section-title">Linha do tempo</h3>
        {timelineItems.length === 0 ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            Sem eventos de timeline neste lote.
          </p>
        ) : (
          <ul className="timeline-list" style={{ marginTop: 10 }}>
            {timelineItems.map((item) => (
              <li key={item.id} className="timeline-item">
                <strong>{item.description}</strong>
                <span className="small-text">
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.createdAt))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
