export interface IEditOrder {
  date: number[]
}
type Mutations = Record<string, (state: IEditOrder, data?: any) => void>

const state: IEditOrder = {
  date: [],
}

const mutations: Mutations = {
  setEditDate(state, val) {
    state.date = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
