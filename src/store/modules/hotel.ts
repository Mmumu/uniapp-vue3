interface ICouponInfo {
  id: string
  couponId: string
  couponType: number
  discountNum: number
  reductionAmount: number
  sourceType: number
}
export interface Hotel {
  hotelId: string
  canRefresh: boolean // 是否可以刷新
  hotelTelephone: string //酒店联系电话
  hotelShowShare: boolean //分享弹框
  showTabbar: boolean //服务页，ios 的 Tabbar会覆盖弹框，解决UI组件兼容问题
  orderId: string // 当前订单id
  isValidCard: boolean // 房卡是否有效
  isMyRoom: boolean // 是否是我的房卡
  liftCode: string // 梯控二维码
  couponInfo: ICouponInfo | null // 优惠券信息
  selectUser: string[] | null // 入住人信息
}
type Mutations = Record<string, (state: Hotel, data?: any) => void>

const state: Hotel = {
  hotelId: '',
  canRefresh: true,
  hotelTelephone: '',
  showTabbar: true,
  orderId: '',
  isValidCard: true,
  hotelShowShare: false,
  isMyRoom: false,
  liftCode: '',
  couponInfo: null,
  selectUser: null,
}

const mutations: Mutations = {
  setHotelPhone(state, val) {
    state.hotelTelephone = val
  },
  setHotelId(state, val) {
    state.hotelId = val
  },
  setCanRefresh(state, val) {
    state.canRefresh = val
  },
  setTabbar(state, val) {
    if (val) {
      // 弹窗关闭时，tabbar延迟出现
      setTimeout(() => {
        state.showTabbar = val
      }, 100)
    } else {
      state.showTabbar = false
    }
  },
  setOrderId(state, val) {
    state.orderId = val
  },
  setValidCard(state, val) {
    state.isValidCard = val
  },
  setShareLog(state, val) {
    state.hotelShowShare = val
  },
  setIsMyRoom(state, val) {
    state.isMyRoom = val
  },
  setLiftCode(state, val) {
    state.liftCode = val
  },
  setCouponInfo(state, val) {
    state.couponInfo = val
  },
  setSelectUser(state, val) {
    state.selectUser = val
  },
}

export default {
  namespaced: true,
  state,
  mutations,
}
