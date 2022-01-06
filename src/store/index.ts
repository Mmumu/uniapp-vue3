// import Vue from 'vue'
// import Vuex, { Store } from 'vuex'
// import state from './state'
// import getters from './getters'
import hotel, { Hotel } from './modules/hotel'
import service, { IServiceHotel } from './modules/service'
import list, { IHotelList } from './modules/list'
import edit, { IEditOrder } from './modules/edit'
import city, { ICity } from './modules/city'
import upload, { IUpload } from './modules/upload'

// Vue.use(Vuex)

// export interface StoreData {
//   hotel: Hotel
//   service: IServiceHotel
//   list: IHotelList
//   edit: IEditOrder
//   city: ICity
//   upload: IUpload
// }

// const store: Store<StoreData> = new Vuex.Store({
//   modules: {
//     hotel,
//     service,
//     list,
//     edit,
//     city,
//     upload,
//   },
//   state,
//   getters,
// })

// export default store

import {createStore, Store} from 'vuex'
const store = createStore({
  modules: {
    hotel,
    service,
    list,
    edit,
    city,
    upload,
  },
  state: {}
})
export default store
