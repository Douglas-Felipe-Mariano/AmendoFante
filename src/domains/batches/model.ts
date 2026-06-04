export type BatchStatus =
  | 'cadastrado'
  | 'secando'
  | 'aguardando_analise'
  | 'pausado'
  | 'finalizado'

export type AlertType = 'inicial' | 'intermediaria' | 'final'

export type AlertStatus = 'pendente' | 'realizado' | 'atrasado'

export interface Batch {
  id: string
  numero: string
  operador: string
  siloId: string
  data: string
  startedAt?: string
  finishedAt?: string
  umidadeChegadaPct: number
  umidadeFinalPct?: number
  observacoes?: string
  status: BatchStatus
  tempoTotalMin?: number
}

export interface AnalysisAlert {
  id: string
  batchId: string
  type: AlertType
  dueMinutes: number
  status: AlertStatus
}

export interface AnalysisRecord {
  id: string
  batchId: string
  alertType: AlertType
  operador: string
  resultado: 'Conforme' | 'Atencao' | 'Critico'
  observacoes?: string
  createdAt: string
}

export interface TimelineEvent {
  id: string
  batchId: string
  type: 'cadastro' | 'inicio' | 'analise' | 'finalizacao'
  description: string
  createdAt: string
}

export interface BatchConsumption {
  batchId: string
  operacaoHoras: number
  gasKg: number
  gasKgPorHora: number
  energiaKwh: number
}

export interface BatchCostEstimate {
  batchId: string
  custoGas: number
  custoEnergia: number
  custoOperacao: number
  custoTotal: number
}

export interface MonitoringSnapshot {
  batchId: string
  timestamp: string
  elapsedMinutes: number
  umidadeArPct: number
  umidadeAmendoimPct: number
  temperaturaC: number
  tempoEstimadoMin: number
  gasKgPorHora: number
  gasAcumuladoKg: number
  statusSecagem: 'Estavel' | 'Atencao' | 'Critico'
}
