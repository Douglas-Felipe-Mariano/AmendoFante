import { useNavigate } from 'react-router-dom'

import { useMemo } from 'react'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'
import { formatCurrencyBRL, formatKg, formatPercent } from '../../../shared/utils/formatters.ts'

export function ManagerHomePage() {
  const navigate = useNavigate()
  const batches = useAppStore((state) => state.batches)
  const costs = useAppStore((state) => state.costs)
  const consumptions = useAppStore((state) => state.consumptions)

  const finalizedBatches = useMemo(
    () => batches.filter((batch) => batch.status === 'finalizado'),
    [batches],
  )

  const avgTime = useMemo(() => {
    if (finalizedBatches.length === 0) {
      return 0
    }

    return finalizedBatches.reduce((sum, batch) => sum + (batch.tempoTotalMin ?? 0), 0) / finalizedBatches.length
  }, [finalizedBatches])

  const avgReduction = useMemo(() => {
    const withFinal = finalizedBatches.filter((batch) => typeof batch.umidadeFinalPct === 'number')
    if (withFinal.length === 0) {
      return 0
    }

    return withFinal.reduce((sum, batch) => sum + (batch.umidadeChegadaPct - (batch.umidadeFinalPct ?? 0)), 0) / withFinal.length
  }, [finalizedBatches])

  const avgCost = useMemo(() => {
    if (costs.length === 0) {
      return 0
    }

    return costs.reduce((sum, item) => sum + item.custoTotal, 0) / costs.length
  }, [costs])

  const avgGasKg = useMemo(() => {
    if (consumptions.length === 0) {
      return 0
    }

    return consumptions.reduce((sum, item) => sum + item.gasKg, 0) / consumptions.length
  }, [consumptions])

  const recentFinalized = finalizedBatches
    .slice()
    .sort((a, b) => new Date(b.finishedAt ?? b.data).getTime() - new Date(a.finishedAt ?? a.data).getTime())
    .slice(0, 5)

  return (
    <>
      <PageHeader
        title="Painel Gerencial"
        description="Consolidado de lotes finalizados, tempo medio, reducao de umidade e custo medio."
        contextLabel="Gerencial"
        actions={(
          <Button variant="secondary" onClick={() => navigate('/historico')}>
            Ver historico completo
          </Button>
        )}
      />

      <Card className="status-highlight" padded={false}>
        <div className="status-highlight-content">
          <span className="status-chip">KPI</span>
          <strong>{finalizedBatches.length > 0 ? `${finalizedBatches.length} lotes finalizados no historico` : 'Sem lotes finalizados ainda'}</strong>
          <span className="small-text">Use o drilldown para abrir o resumo consolidado por lote</span>
        </div>
      </Card>

      <section className="stat-grid">
        <StatCard label="Lotes concluidos" value={String(finalizedBatches.length)} tone="success" />
        <StatCard label="Tempo medio" value={`${Math.round(avgTime)} min`} />
        <StatCard label="Reducao media" value={formatPercent(avgReduction)} />
        <StatCard label="Gas medio por lote" value={formatKg(avgGasKg)} helper="Consumo consolidado em KG" />
        <StatCard label="Custo medio" value={formatCurrencyBRL(avgCost)} />
      </section>

      <Card>
        <h3 className="section-title">Ultimos lotes finalizados</h3>
        {recentFinalized.length === 0 ? (
          <p className="small-text" style={{ marginTop: 10 }}>
            Nenhum lote finalizado ainda.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Operador</th>
                  <th>Data finalizacao</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {recentFinalized.map((batch) => (
                  <tr key={batch.id}>
                    <td>{batch.numero}</td>
                    <td>{batch.operador}</td>
                    <td>
                      {batch.finishedAt
                        ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(batch.finishedAt))
                        : '-'}
                    </td>
                    <td>
                      <Button variant="secondary" onClick={() => navigate(`/gerencial/lotes/${batch.id}/resumo`)}>
                        Drilldown do lote
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

