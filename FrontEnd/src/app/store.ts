import { create } from 'zustand'
import { z } from 'zod'

import type { UserRole } from '../domains/auth/model.ts'
import type { Batch } from '../domains/batches/model.ts'
import type { Silo } from '../domains/silos/model.ts'
import { createSeedBatches, createSeedSilos } from '../mocks/seeds.ts'
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
  umidadeChegadaPct: z.number(),
  umidadeFinalPct: z.number().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['cadastrado', 'secando', 'pausado', 'finalizado']),
  tempoTotalMin: z.number().optional(),
})

const appPersistedStateSchema = z.object({
  session: sessionSchema,
  silos: z.array(siloSchema),
  batches: z.array(batchSchema),
  selectedSiloId: z.string().nullable(),
  activeBatchId: z.string().nullable(),
})

type AppPersistedState = z.infer<typeof appPersistedStateSchema>

type NewSiloInput = Omit<Silo, 'id'>
type NewBatchInput = Omit<
  Batch,
  'id' | 'status' | 'umidadeFinalPct' | 'tempoTotalMin'
>

export interface AppStore extends AppPersistedState {
  login: (userName: string) => void
  logout: () => void
  chooseRole: (role: UserRole) => void
  addSilo: (payload: NewSiloInput) => void
  updateSilo: (siloId: string, payload: NewSiloInput) => void
  selectSilo: (siloId: string) => void
  addBatch: (payload: NewBatchInput) => string
  startBatch: (batchId: string) => void
  setActiveBatch: (batchId: string | null) => void
  resetData: () => void
}

function createSeedState(): AppPersistedState {
  const silos = createSeedSilos()
  const batches = createSeedBatches()

  return {
    session: {
      isAuthenticated: false,
      userName: '',
      role: null,
    },
    silos,
    batches,
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

  return parsedState.data
}

function pickPersistedState(state: AppStore): AppPersistedState {
  return {
    session: state.session,
    silos: state.silos,
    batches: state.batches,
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
              }
            : batch
        )),
        activeBatchId: batchId,
      }))
      persistState()
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

