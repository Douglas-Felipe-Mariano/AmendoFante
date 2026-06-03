import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppStore } from '../../../app/store.ts'
import { Button } from '../../../design-system/components/Button.tsx'
import { Card } from '../../../design-system/components/Card.tsx'
import { PageHeader } from '../../../design-system/components/PageHeader.tsx'
import { StatCard } from '../../../design-system/components/StatCard.tsx'
import { SiloCard } from '../components/SiloCard.tsx'

export function SilosDashboardPage() {
  const navigate = useNavigate()
  const silos = useAppStore((state) => state.silos)
  const selectedSiloId = useAppStore((state) => state.selectedSiloId)
  const selectSilo = useAppStore((state) => state.selectSilo)
  const resetData = useAppStore((state) => state.resetData)

  const stats = useMemo(() => {
    const activeCount = silos.filter((silo) => silo.status === 'ativo' || silo.status === 'atencao').length
    const attentionCount = silos.filter((silo) => silo.status === 'atencao').length
    const averageAirHumidity = silos.length
      ? silos.reduce((sum, silo) => sum + silo.umidadeRelativaPct, 0) / silos.length
      : 0
    const averagePeanutHumidity = silos.length
      ? silos.reduce((sum, silo) => sum + silo.umidadeAmendoimPct, 0) / silos.length
      : 0

    return {
      activeCount,
      attentionCount,
      averageAirHumidity,
      averagePeanutHumidity,
    }
  }, [silos])

  return (
    <>
      <PageHeader
        title="Dashboard de Silos"
        description="Etapa 2: listar, selecionar, cadastrar e editar silos com indicadores mockados."
        contextLabel="Desktop"
        actions={(
          <>
            <Button onClick={() => navigate('/silos/novo')}>Cadastrar Silo</Button>
            <Button variant="secondary" onClick={() => navigate('/lotes/novo')} disabled={silos.length === 0}>
              Cadastrar Lote
            </Button>
            <Button variant="ghost" onClick={resetData}>Resetar dados mock</Button>
          </>
        )}
      />

      <Card className="status-highlight" padded={false}>
        <div className="status-highlight-content">
          <span className="status-chip">Secagem</span>
          <strong>{stats.attentionCount > 0 ? `${stats.attentionCount} silo(s) em atencao` : 'Operacao dentro da faixa esperada'}</strong>
          <span className="small-text">Atualizacao por dados mockados em tempo real</span>
        </div>
      </Card>

      <section className="stat-grid">
        <StatCard label="Silos ativos" value={String(stats.activeCount)} helper="Em operacao ou atencao" tone="success" />
        <StatCard label="Em atencao" value={String(stats.attentionCount)} helper="Prioridade no turno" tone={stats.attentionCount > 0 ? 'warning' : 'default'} />
        <StatCard label="Umidade media do ar" value={`${stats.averageAirHumidity.toFixed(1)}%`} helper="Referencia ambiental" />
        <StatCard label="Umidade media do amendoim" value={`${stats.averagePeanutHumidity.toFixed(1)}%`} helper="Indicador interno do silo" />
      </section>

      {silos.length === 0 ? (
        <Card>
          <h3 className="section-title">Nenhum silo cadastrado</h3>
          <p className="small-text">Cadastre ao menos um silo para iniciar o fluxo operacional.</p>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => navigate('/silos/novo')}>Cadastrar primeiro silo</Button>
          </div>
        </Card>
      ) : (
        <section className="silo-grid">
          {silos.map((silo) => (
            <SiloCard
              key={silo.id}
              silo={silo}
              selected={selectedSiloId === silo.id}
              onSelect={() => selectSilo(silo.id)}
              onEdit={() => navigate(`/silos/${silo.id}/editar`)}
            />
          ))}
        </section>
      )}
    </>
  )
}

