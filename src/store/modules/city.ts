export interface ICity {
  city: string
  cities: any[]
  hotCities: any[]
}
type Mutations = Record<string, (state: ICity, data?: any) => void>

const state: ICity = {
  city: '我的位置',
  cities: [],
  hotCities: [],
}

const mutations: Mutations = {
  setCity(state, val) {
    state.city = val
  },
  setCities(state, val) {
    state.cities = val
  },
  setHotCities(state, val) {
    state.hotCities = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
