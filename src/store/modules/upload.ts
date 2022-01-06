import type { Config } from '@/modules/rate/views/hotelComment/utils/upload/config'

export interface IUpload {
  config: Config | null
}

type Mutations = Record<string, (state: IUpload, data?: any) => void>

const state: IUpload = {
  config: null,
}

const mutations: Mutations = {
  setConfig(state, val) {
    state.config = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
