import { differenceInMinutes } from 'date-fns'

import type {
  AlertType,
  AnalysisAlert,
  Batch,
  BatchConsumption,
  BatchCostEstimate,
  MonitoringSnapshot,
} from '../domains/batches/model.ts'
import type { Silo } from '../domains/silos/model.ts'

export function createSeedSilos(): Silo[] {
  return [
    {
      id: 'silo-01',
      codigo: 'S-01',
      nome: 'Silo Principal Norte',
      capacidadeKg: 180000,
      status: 'ativo',
      umidadeRelativaPct: 62,
      umidadeAmendoimPct: 14.6,
      temperaturaC: 39,
      tempoEstimadoMin: 280,
      observacoes: 'Operacao regular',
    },
    {
      id: 'silo-02',
      codigo: 'S-02',
      nome: 'Silo Leste',
      capacidadeKg: 165000,
      status: 'atencao',
      umidadeRelativaPct: 68,
      umidadeAmendoimPct: 17.2,
      temperaturaC: 42,
      tempoEstimadoMin: 340,
      observacoes: 'Acompanhamento em ciclo intermediario',
    },
    {
      id: 'silo-03',
      codigo: 'S-03',
      nome: 'Silo Reserva',
      capacidadeKg: 150000,
      status: 'manutencao',
      umidadeRelativaPct: 0,
      umidadeAmendoimPct: 0,
      temperaturaC: 0,
      tempoEstimadoMin: 0,
      observacoes: 'Em inspecao de rotina',
    },
  ]
}

export function createSeedBatches(): Batch[] {
  const today = new Date().toISOString().slice(0, 10)

  return [
    {
      id: 'lote-ativo-01',
      numero: 'LT-2026-101',
      operador: 'Equipe Turno A',
      siloId: 'silo-01',
      data: today,
      umidadeChegadaPct: 16.2,
      observacoes: 'Carga recebida no inicio do turno',
      status: 'cadastrado',
    },
  ]
}

const ALERT_MINUTES: Record<AlertType, number> = {
  inicial: 20,
  intermediaria: 90,
  final: 180,
}

export function createDefaultAnalysisAlerts(batchId: string): AnalysisAlert[] {
  return (Object.entries(ALERT_MINUTES) as Array<[AlertType, number]>).map(([type, dueMinutes]) => ({
    id: `${batchId}-${type}`,
    batchId,
    type,
    dueMinutes,
    status: 'pendente',
  }))
}

export function estimateConsumptionAndCosts(
  batchId: string,
  tempoTotalMin: number,
): {
  consumption: BatchConsumption
  costs: BatchCostEstimate
} {
  const operacaoHoras = Number((tempoTotalMin / 60).toFixed(2))
  const gasKgPorHora = 13.2
  const gasKg = Number((operacaoHoras * gasKgPorHora).toFixed(1))
  const energiaKwh = Number((operacaoHoras * 7.4).toFixed(1))

  const custoGas = Number((gasKg * 4.15).toFixed(2))
  const custoEnergia = Number((energiaKwh * 0.92).toFixed(2))
  const custoOperacao = Number((operacaoHoras * 45).toFixed(2))
  const custoTotal = Number((custoGas + custoEnergia + custoOperacao).toFixed(2))

  return {
    consumption: {
      batchId,
      operacaoHoras,
      gasKg,
      gasKgPorHora,
      energiaKwh,
    },
    costs: {
      batchId,
      custoGas,
      custoEnergia,
      custoOperacao,
      custoTotal,
    },
  }
}

export function buildMonitoringSnapshot(
  batch: Batch,
  silo: Silo,
  now: Date = new Date(),
): MonitoringSnapshot {
  const startedAt = new Date(batch.startedAt ?? batch.data)
  const elapsedMinutes = Math.max(0, differenceInMinutes(now, startedAt))
  const oscillation = ((elapsedMinutes % 12) - 6) / 10
  const temperaturaC = Number((silo.temperaturaC + oscillation * 2.4).toFixed(1))
  const umidadeArPct = Number((silo.umidadeRelativaPct + oscillation).toFixed(1))
  const internalHumidityBase = silo.umidadeAmendoimPct > 0
    ? silo.umidadeAmendoimPct
    : batch.umidadeChegadaPct
  const dryingDropPct = elapsedMinutes * 0.018
  const umidadeAmendoimPct = Number(
    Math.max(6.5, internalHumidityBase - dryingDropPct + oscillation * 0.35).toFixed(1),
  )
  const tempoEstimadoMin = Math.max(0, silo.tempoEstimadoMin - elapsedMinutes)
  const gasKgPorHora = Number((11.5 + temperaturaC / 10).toFixed(1))
  const gasAcumuladoKg = Number(((elapsedMinutes / 60) * gasKgPorHora).toFixed(1))

  const statusSecagem =
    temperaturaC >= 48 ? 'Critico' : temperaturaC >= 42 ? 'Atencao' : 'Estavel'

  return {
    batchId: batch.id,
    timestamp: now.toISOString(),
    elapsedMinutes,
    umidadeArPct,
    umidadeAmendoimPct,
    temperaturaC,
    tempoEstimadoMin,
    gasKgPorHora,
    gasAcumuladoKg,
    statusSecagem,
  }
}

