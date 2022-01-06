export interface IServiceHotel {
  roomId: string
  hotelId: string
  startTime: string
  continueRoom: any
  oldOrderInfo: any
}
type Mutations = Record<string, (state: IServiceHotel, data?: any) => void>

const state: IServiceHotel = {
  roomId: '',
  hotelId: '',
  startTime: '',
  continueRoom: null,
  oldOrderInfo: null,
}

const mutations: Mutations = {
  setRoomId(state, val) {
    state.roomId = val
  },
  setHotelId(state, val) {
    state.hotelId = val
  },
  setStartTime(state, val) {
    state.startTime = val
  },
  setContinueRoom(state, val) {
    state.continueRoom = val
  },
  setOldOrderInfo(state, val) {
    state.oldOrderInfo = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
