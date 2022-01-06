export interface IHotelList {
  date: number[]
  city: string
  keyWord: string
  brands: any[]
}
type Mutations = Record<string, (state: IHotelList, data?: any) => void>

const state: IHotelList = {
  date: [
    new Date().setHours(0, 0, 0, 0),
    new Date().setHours(0, 0, 0, 0) + 24 * 3600 * 1000,
  ],
  city: '杭州市',
  keyWord: '',
  brands: [],
}

const mutations: Mutations = {
  setDate(state, val) {
    state.date = val
  },
  setCity(state, val) {
    state.city = val
  },
  setBrands(state, val) {
    state.brands = val
  },
  setKeyWord(state, val) {
    state.keyWord = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
