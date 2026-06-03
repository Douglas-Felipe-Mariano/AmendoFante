import { create } from 'zustand'
import { z } from 'zod'
import { differenceInMinutes } from 'date-fns'

import type { UserRole } from '../domains/auth/model.ts'
import type {
  AlertType,
  AnalysisAlert,
  AnalysisRecord,
  Batch,
  TimelineEvent,
} from '../domains/batches/model.ts'
import type { Silo } from '../domains/silos/model.ts'
import {
  createDefaultAnalysisAlerts,
  createSeedBatches,
  createSeedSilos,
  estimateConsumptionAndCosts,
} from '../mocks/seeds.ts'
import { STORAGE_KEYS } from '../shared/constants/storageKeys.ts'
import { createEntityId } from '../shared/utils/id.ts'
import { readJSON, writeJSON } from '../storage/localStorage.ts'

const sessionSchema = z.object({
  isAuthenticated: z.boolean(),
  userName: z.string(),
  role: z.enum(['operador', 'gestor']).nullable(),
})

const siloSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nome: z.string(),
  capacidadeKg: z.number(),
  status: z.enum(['ativo', 'atencao', 'manutencao', 'inativo']),
  umidadeRelativaPct: z.number(),
  umidadeAmendoimPct: z.number().default(0),
  temperaturaC: z.number(),
  tempoEstimadoMin: z.number(),
  observacoes: z.string().optional(),
})

const batchSchema = z.object({
  id: z.string(),
  numero: z.string(),
  operador: z.string(),
  siloId: z.string(),
  data: z.string(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  umidadeChegadaPct: z.number(),
  umidadeFinalPct: z.number().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['cadastrado', 'secando', 'aguardando_analise', 'pausado', 'finalizado']),
  tempoTotalMin: z.number().optional(),
})

const analysisAlertSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  type: z.enum(['inicial', 'intermediaria', 'final']),
  dueMinutes: z.number(),
  status: z.enum(['pendente', 'realizado', 'atrasado']),
})

const analysisRecordSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  alertType: z.enum(['inicial', 'intermediaria', 'final']),
  operador: z.string(),
  resultado: z.enum(['Conforme', 'Atencao', 'Critico']),
  observacoes: z.string().optional(),
  createdAt: z.string(),
})

const timelineEventSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  type: z.enum(['cadastro', 'inicio', 'analise', 'finalizacao']),
  description: z.string(),
  createdAt: z.string(),
})

const batchConsumptionSchema = z.object({
  batchId: z.string(),
  operacaoHoras: z.number(),
  gasKg: z.number(),
  gasKgPorHora: z.number(),
  energiaKwh: z.number(),
})

const batchCostSchema = z.object({
  batchId: z.string(),
  custoGas: z.number(),
  custoEnergia: z.number(),
  custoOperacao: z.number(),
  custoTotal: z.number(),
})

const appPersistedStateSchema = z.object({
  session: sessionSchema,
  silos: z.array(siloSchema),
  batches: z.array(batchSchema),
  analysisAlerts: z.array(analysisAlertSchema).default([]),
  analysisRecords: z.array(analysisRecordSchema).default([]),
  timeline: z.array(timelineEventSchema).default([]),
  consumptions: z.array(batchConsumptionSchema).default([]),
  costs: z.array(batchCostSchema).default([]),
  selectedSiloId: z.string().nullable().default(null),
  activeBatchId: z.string().nullable().default(null),
})

type AppPersistedState = z.infer<typeof appPersistedStateSchema>

type NewSiloInput = Omit<Silo, 'id'>
type NewBatchInput = Omit<
  Batch,
  'id' | 'status' | 'umidadeFinalPct' | 'tempoTotalMin' | 'startedAt' | 'finishedAt'
>

type RecordAnalysisInput = {
  batchId: string
  alertType: AlertType
  resultado: AnalysisRecord['resultado']
  observacoes?: string
}

type FinalizeBatchInput = {
  umidadeFinalPct: number
  tempoTotalMin: number
  observacoes?: string
}

export interface AppStore extends AppPersistedState {
  login: (userName: string) => void
  logout: () => void
  chooseRole: (role: UserRole) => void
  addSilo: (payload: NewSiloInput) => void
  updateSilo: (siloId: string, payload: NewSiloInput) => void
  selectSilo: (siloId: string) => void
  addBatch: (payload: NewBatchInput) => string
  startBatch: (batchId: string) => void
  refreshBatchAlerts: (batchId: string, elapsedMinutes?: number) => void
  recordAnalysis: (payload: RecordAnalysisInput) => void
  finalizeBatch: (batchId: string, payload: FinalizeBatchInput) => boolean
  setActiveBatch: (batchId: string | null) => void
  resetData: () => void
}

function buildTimelineEvent(
  batchId: string,
  type: TimelineEvent['type'],
  description: string,
): TimelineEvent {
  return {
    id: createEntityId('timeline'),
    batchId,
    type,
    description,
    createdAt: new Date().toISOString(),
  }
}

function getElapsedMinutes(batch: Batch): number {
  if (!batch.startedAt) {
    return 0
  }

  const startedAtDate = new Date(batch.startedAt)
  if (Number.isNaN(startedAtDate.getTime())) {
    return 0
  }

  return Math.max(0, differenceInMinutes(new Date(), startedAtDate))
}

function recomputeAlertStatuses(
  alerts: AnalysisAlert[],
  records: AnalysisRecord[],
  elapsedMinutes: number,
): AnalysisAlert[] {
  return alerts.map((alert) => {
    const hasRecord = records.some((record) => record.alertType === alert.type)

    if (hasRecord) {
      return {
        ...alert,
        status: 'realizado',
      }
    }

    if (elapsedMinutes > alert.dueMinutes) {
      return {
        ...alert,
        status: 'atrasado',
      }
    }

    return {
      ...alert,
      status: 'pendente',
    }
  })
}

function createSeedState(): AppPersistedState {
  const silos = createSeedSilos()
  const batches = createSeedBatches()
  const timeline = batches.map((batch) => ({
    id: createEntityId('timeline'),
    batchId: batch.id,
    type: 'cadastro' as const,
    description: `Lote ${batch.numero} cadastrado`,
    createdAt: new Date().toISOString(),
  }))

  return {
    session: {
      isAuthenticated: false,
      userName: '',
      role: null,
    },
    silos,
    batches,
    analysisAlerts: [],
    analysisRecords: [],
    timeline,
    consumptions: [],
    costs: [],
    selectedSiloId: silos[0]?.id ?? null,
    activeBatchId: batches[0]?.id ?? null,
  }
}

function loadState(): AppPersistedState {
  const fallback = createSeedState()
  const rawState = readJSON<unknown | null>(STORAGE_KEYS.appState, null)

  if (rawState === null) {
    return fallback
  }

  const parsedState = appPersistedStateSchema.safeParse(rawState)
  if (!parsedState.success) {
    return fallback
  }

  const normalizedSilos = parsedState.data.silos.map((silo) => {
    if (silo.umidadeAmendoimPct > 0) {
      return silo
    }

    if (silo.umidadeRelativaPct <= 0) {
      return silo
    }

    return {
      ...silo,
      umidadeAmendoimPct: Number((silo.umidadeRelativaPct * 0.24).toFixed(1)),
    }
  })

  return {
    ...parsedState.data,
    silos: normalizedSilos,
  }
}

function pickPersistedState(state: AppStore): AppPersistedState {
  return {
    session: state.session,
    silos: state.silos,
    batches: state.batches,
    analysisAlerts: state.analysisAlerts,
    analysisRecords: state.analysisRecords,
    timeline: state.timeline,
    consumptions: state.consumptions,
    costs: state.costs,
    selectedSiloId: state.selectedSiloId,
    activeBatchId: state.activeBatchId,
  }
}

const initialState = loadState()

export const useAppStore = create<AppStore>((set, get) => {
  const persistState = () => {
    writeJSON(STORAGE_KEYS.appState, pickPersistedState(get()))
  }

  return {
    ...initialState,

    login: (userName) => {
      const normalizedName = userName.trim() || 'Operador'
      set((state) => ({
        session: {
          ...state.session,
          isAuthenticated: true,
          userName: normalizedName,
        },
      }))
      persistState()
    },

    logout: () => {
      set((state) => ({
        session: {
          ...state.session,
          isAuthenticated: false,
          role: null,
        },
      }))
      persistState()
    },

    chooseRole: (role) => {
      set((state) => ({
        session: {
          ...state.session,
          role,
        },
      }))
      persistState()
    },

    addSilo: (payload) => {
      set((state) => ({
        silos: [...state.silos, { ...payload, id: createEntityId('silo') }],
      }))
      persistState()
    },

    updateSilo: (siloId, payload) => {
      set((state) => ({
        silos: state.silos.map((silo) => (
          silo.id === siloId ? { ...payload, id: siloId } : silo
        )),
      }))
      persistState()
    },

    selectSilo: (siloId) => {
      set(() => ({ selectedSiloId: siloId }))
      persistState()
    },

    addBatch: (payload) => {
      let batchId = ''

      set((state) => {
        batchId = createEntityId('lote')
        return {
          batches: [
            ...state.batches,
            {
              ...payload,
              id: batchId,
              status: 'cadastrado',
            },
          ],
          timeline: [
            ...state.timeline,
            buildTimelineEvent(batchId, 'cadastro', `Lote ${payload.numero} cadastrado`),
          ],
          selectedSiloId: payload.siloId,
          activeBatchId: batchId,
        }
      })

      persistState()
      return batchId
    },

    startBatch: (batchId) => {
      set((state) => ({
        batches: state.batches.map((batch) => (
          batch.id === batchId
            ? {
                ...batch,
                status: 'secando',
                startedAt: batch.startedAt ?? new Date().toISOString(),
              }
            : batch
        )),
        analysisAlerts: state.analysisAlerts.some((alert) => alert.batchId === batchId)
          ? state.analysisAlerts
          : [...state.analysisAlerts, ...createDefaultAnalysisAlerts(batchId)],
        timeline: state.timeline.some((event) => event.batchId === batchId && event.type === 'inicio')
          ? state.timeline
          : [...state.timeline, buildTimelineEvent(batchId, 'inicio', 'Secagem iniciada')],
        activeBatchId: batchId,
      }))
      persistState()
    },

    refreshBatchAlerts: (batchId, elapsedMinutes) => {
      let didUpdate = false

      set((state) => {
        const targetBatch = state.batches.find((batch) => batch.id === batchId)
        if (!targetBatch) {
          return {}
        }

        const batchAlerts = state.analysisAlerts.filter((alert) => alert.batchId === batchId)
        if (batchAlerts.length === 0) {
          return {}
        }

        const batchRecords = state.analysisRecords.filter((record) => record.batchId === batchId)
        const elapsed = elapsedMinutes ?? getElapsedMinutes(targetBatch)
        const updatedBatchAlerts = recomputeAlertStatuses(batchAlerts, batchRecords, elapsed)

        const updatedAlertById = new Map(updatedBatchAlerts.map((alert) => [alert.id, alert]))
        let alertsChanged = false

        const nextAnalysisAlerts = state.analysisAlerts.map((alert) => {
          if (alert.batchId !== batchId) {
            return alert
          }

          const updatedAlert = updatedAlertById.get(alert.id)
          if (!updatedAlert || updatedAlert.status === alert.status) {
            return alert
          }

          alertsChanged = true
          return updatedAlert
        })

        const hasOverdue = updatedBatchAlerts.some((alert) => alert.status === 'atrasado')
        const targetStatus: Batch['status'] = hasOverdue ? 'aguardando_analise' : 'secando'
        let batchChanged = false

        const nextBatches = state.batches.map((batch) => {
          if (batch.id !== batchId || batch.status === 'finalizado') {
            return batch
          }

          if (batch.status === targetStatus) {
            return batch
          }

          batchChanged = true
          return {
            ...batch,
            status: targetStatus,
          }
        })

        if (!alertsChanged && !batchChanged) {
          return {}
        }

        didUpdate = true
        return {
          analysisAlerts: nextAnalysisAlerts,
          batches: nextBatches,
        }
      })

      if (didUpdate) {
        persistState()
      }
    },

    recordAnalysis: ({ batchId, alertType, resultado, observacoes }) => {
      set((state) => {
        const batch = state.batches.find((item) => item.id === batchId)
        if (!batch) {
          return {}
        }

        const nextRecord: AnalysisRecord = {
          id: createEntityId('analise'),
          batchId,
          alertType,
          operador: state.session.userName || 'Operador',
          resultado,
          observacoes: observacoes?.trim(),
          createdAt: new Date().toISOString(),
        }

        const nextRecords = [...state.analysisRecords, nextRecord]
        const batchAlerts = state.analysisAlerts.filter((alert) => alert.batchId === batchId)
        const elapsed = getElapsedMinutes(batch)
        const updatedBatchAlerts = recomputeAlertStatuses(
          batchAlerts,
          nextRecords.filter((record) => record.batchId === batchId),
          elapsed,
        )

        const hasOverdue = updatedBatchAlerts.some((alert) => alert.status === 'atrasado')

        return {
          analysisRecords: nextRecords,
          analysisAlerts: state.analysisAlerts.map((alert) => {
            if (alert.batchId !== batchId) {
              return alert
            }

            return updatedBatchAlerts.find((updated) => updated.id === alert.id) ?? alert
          }),
          batches: state.batches.map((item) => (
            item.id === batchId && item.status !== 'finalizado'
              ? {
                  ...item,
                  status: hasOverdue ? 'aguardando_analise' : 'secando',
                }
              : item
          )),
          timeline: [
            ...state.timeline,
            buildTimelineEvent(batchId, 'analise', `Analise ${alertType} registrada (${resultado})`),
          ],
        }
      })
      persistState()
    },

    finalizeBatch: (batchId, payload) => {
      let finalized = false

      set((state) => {
        const batch = state.batches.find((item) => item.id === batchId)
        if (!batch) {
          return {}
        }

        const batchAlerts = state.analysisAlerts.filter((alert) => alert.batchId === batchId)
        const allAlertsCompleted = batchAlerts.length > 0
          && batchAlerts.every((alert) => alert.status === 'realizado')

        if (!allAlertsCompleted) {
          return {}
        }

        const finishedAt = new Date().toISOString()
        const { consumption, costs } = estimateConsumptionAndCosts(batchId, payload.tempoTotalMin)
        finalized = true

        return {
          batches: state.batches.map((item) => (
            item.id === batchId
              ? {
                  ...item,
                  status: 'finalizado',
                  umidadeFinalPct: payload.umidadeFinalPct,
                  tempoTotalMin: payload.tempoTotalMin,
                  observacoes: payload.observacoes?.trim() || item.observacoes,
                  finishedAt,
                }
              : item
          )),
          consumptions: [
            ...state.consumptions.filter((item) => item.batchId !== batchId),
            consumption,
          ],
          costs: [
            ...state.costs.filter((item) => item.batchId !== batchId),
            costs,
          ],
          timeline: [
            ...state.timeline,
            buildTimelineEvent(
              batchId,
              'finalizacao',
              `Lote finalizado com umidade final de ${payload.umidadeFinalPct.toFixed(1)}%`,
            ),
          ],
          activeBatchId: state.activeBatchId === batchId ? null : state.activeBatchId,
        }
      })

      persistState()
      return finalized
    },

    setActiveBatch: (batchId) => {
      set(() => ({ activeBatchId: batchId }))
      persistState()
    },

    resetData: () => {
      const resetState = createSeedState()
      set(() => ({ ...resetState }))
      writeJSON(STORAGE_KEYS.appState, resetState)
    },
  }
})

