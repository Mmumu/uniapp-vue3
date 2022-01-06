import lsxmRequest from '@/plugins/request'
import { HOTEL_URL } from '@/config'

/**
 * @method 获取订单信息
 * @param { string } id 订单id
 */
export function getOrderDetail(orderNo: string, noLoading: number = 0) {
  return lsxmRequest.get(
    `${HOTEL_URL}/OrderMain/getRoomMainOrderById`,
    {
      mainOrderId: orderNo,
    },
    {
      header: {
        noLoading,
      },
    }
  )
}

/**
 * @method 订单取消
 * @param { string } orderNo 订单id
 */
export function deleteHotelOrder(mainOrderId: string) {
  return lsxmRequest.post(`${HOTEL_URL}/OrderMain/cancel`, {
    mainOrderId,
  })
}

/**
 * @method 所有订单列表
 * @param { number } pageNum  页数
 * @param { number } pageSize 个数
 */
interface AllOrder {
  pageNum: number
  pageSize: number
  contentStatus: number
}
export function getAllOrder(params: AllOrder) {
  const data: any = {}
  let url = `${HOTEL_URL}/OrderMain/page`
  if (params.contentStatus) {
    url = `${HOTEL_URL}/OrderMain/page?contentStatus=${params.contentStatus}`
  }
  return lsxmRequest.post(url, null, {
    header: {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    },
  })
}

/**
 * @method 无责修改订单
 */
interface IEditOrder {
  bookerName: string
  bookerPhone: string
  brandId: string
  brandName: string
  brandRoomTypeId: string
  brandRoomTypeName: string
  channelType: number
  sourceType: number
  count: number
  couponId: string
  endTime: string
  guestNameList: string[]
  hotelId: string
  hotelName: string
  hotelRoomTypeId: string
  hotelSystemType: string
  orderMainId: string
  priceCodeId: string
  remark: string
  startTime: string
}
export function changeOrder(params: IEditOrder) {
  params.channelType = 1
  return lsxmRequest.post(
    `${HOTEL_URL}/OrderMain/modifyOrderOfUnconditional`,
    params
  )
}

/**
 * @method 查询续住是否有房型
 */
interface IContinueRoom {
  days: number
  hotelId: string
  hotelRoomTypeId: number
  startTime: string
}
export function continueRoom(params: IContinueRoom) {
  return lsxmRequest.post(
    `${HOTEL_URL}/tower/hotel/getContinuationPrice`,
    params
  )
}

/**
 * @method 续住支付
 */
interface IContinueLive {
  bookerName: string
  bookerPhone: string
  channelType: 1
  couponId: string
  sourceType: number
  endTime: string
  guestNames: string
  orderMainId: string
  priceCodeId: string
  roomNo: string
  roomOrderId: string
}
export function continueLive(params: IContinueLive) {
  return lsxmRequest.post(`${HOTEL_URL}/OrderMain/continueLive`, params)
}
