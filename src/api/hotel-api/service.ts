/* 酒店服务页接口 */
import lsxmRequest from '@/plugins/request'
import { HOTEL_URL } from '@/config'

/**
 * @method 获取电梯二维码
 */
export const getElevatorImg = (id: string) => {
  return lsxmRequest.get(`${HOTEL_URL}/eroomcard/elevator`, {
    id,
  })
}

/**
 * @method 获取房间密码
 */
export const getPassword = (id: string) => {
  return lsxmRequest.get(
    `${HOTEL_URL}/eroomcard/password`,
    {
      id,
    },
    {
      header: {
        noLoading: 1,
      },
    }
  )
}

/**
 * @method 获取已提供的服务
 */
interface IGetService {
  hotelId: string
  roomNum: string
  startTime: string
}
export const getHaveService = (params: IGetService) => {
  return lsxmRequest.post(`${HOTEL_URL}/roomService/listRoomService`, params)
}

/**
 * @method 判断用户是否在开元注册
 * 此接口对前端毫无意义，起到一个告知后台去开元检验用户是否已注册的目的
 */
export const checkIsRegister = () => {
  return lsxmRequest.post(`${HOTEL_URL}/roomService/checkIsRegister`)
}

/**
 * @method 获取送物和服务类型
 */
/**
 * @method 获取已提供的服务
 */
interface IAllService {
  companyId: Number
}
export const getAllService = (params: IAllService) => {
  return lsxmRequest.get(
    `${HOTEL_URL}/roomService/listDeliveryAndServiceType?companyId=${params.companyId}`
  )
}

/**
 * @method 提交服务类型
 */
interface IParams {
  hotelId: string
  roomNum: string
  roomServiceItemList: any
}
export const postService = (params: IParams) => {
  return lsxmRequest.post(`${HOTEL_URL}/roomService/saveRoomService`, params)
}

/**
 * @method 查询已完成服务
 */
interface IComplete {
  hotelId: string
  roomNum: string
  startTime: string
}
export const getCompleteService = (params: IComplete) => {
  return lsxmRequest.get(`${HOTEL_URL}/roomService/listFinishedByPhone`, {
    hotelId: params.hotelId,
    roomNum: params.roomNum,
    startTime: params.startTime,
  })
}

// ------------------------------------------------------------------------------------------------------>

/**
 * @method 获取我的房卡列表
 * @param { string } phone // 手机号码
 */
export function getRoomList(data: any) {
  return lsxmRequest.get(`${HOTEL_URL}/eroomcard/list`, data)
}

/**
 * @method 查询有房卡的酒店列表
 * @param { string } phone // 手机号码
 */
export function getHotelList(data: any) {
  return lsxmRequest.get(
    `${HOTEL_URL}/eroomcard/queryHotelWithCardByPhone`,
    data
  )
}

/**
 * @method 获取行程的电梯服务
 * @param { string } phone     // 行程订单的手机号
 * @param { string } startTime // 行程订单的开始时间
 */
export function getJourneyLift(data: any) {
  return lsxmRequest.post(
    `${HOTEL_URL}/eroomcard/getElevatorQRCodeByArrTimeAndPhone`,
    data
  )
}

/**
 * @method 根据pmsId查询订单
 * @param { string } orderPmsId // pms的订单预订id
 */
export function getOrderField(data: any) {
  return lsxmRequest.get(`${HOTEL_URL}/PreOrderInfo/list/by/ecard`, data)
}

/**
 * @method 查询房型信息
 * @param { string } roomTypeCode // 房型编号
 */
export function getRoomTypeByCode(data: any) {
  return lsxmRequest.get(
    `${HOTEL_URL}/roomType/queryRoomTypeByRoomTypeCode`,
    data
  )
  // return lsxmRequest.get(`${HOTEL_URL}/roomType/queryRoomTypeById`, data)
}

/**
 * @method 查询wifi账号密码
 * @param { string } hotelId // 酒店id
 */
export function getWifiInfo(data: any) {
  return lsxmRequest.get(`${HOTEL_URL}/wifi/get/list`, data)
}

/**
 * @method 减房卡开门次数
 * @param { string } id // 房卡的id
 */
export function reduceCount(data: any) {
  return lsxmRequest.put(
    `${HOTEL_URL}/eroomcard/reduceCount?id=${data.id}`,
    null,
    {
      header: {
        noLoading: 1,
      },
    }
  )
}
