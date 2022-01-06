import lsxmRequest from '@/plugins/request'
import { HOTEL_URL, VIP_URL } from '@/config'

/**
 * @method 下订单
 */
interface IOrder {
  startTime: string
  endTime: string
  guestNameList: string[]
  bookerName: string
  bookerPhone: string
  count: number
  hotelId: string
  sourceType: number
  couponId: string
  hotelName: string
  hotelRoomTypeId: string
  hotelSystemType: number
  priceCodeId: string
  remark: string
  brandId: string
  brandName: string
  brandRoomTypeId: string
  brandRoomTypeName: string
  isKy: number
}
export function addOrder({
  startTime,
  endTime,
  guestNameList,
  bookerName,
  bookerPhone,
  count,
  hotelId,
  couponId,
  sourceType,
  hotelName,
  hotelRoomTypeId,
  hotelSystemType,
  priceCodeId,
  remark,
  brandId,
  brandName,
  brandRoomTypeId,
  brandRoomTypeName,
}: IOrder) {
  const params = {
    startTime,
    endTime,
    guestNameList,
    bookerName,
    bookerPhone,
    count,
    hotelId,
    hotelName,
    hotelRoomTypeId,
    hotelSystemType,
    priceCodeId,
    remark,
    couponId,
    brandId,
    sourceType,
    brandName,
    brandRoomTypeId,
    brandRoomTypeName,
    channelType: 1,
  }
  return lsxmRequest.post(
    `${HOTEL_URL}/OrderMain/addNoPayDayRoomMainOrder`,
    params
  )
}

/**
 * @method 发起支付订单
 */

interface IPay {
  channel: 1
  openId: string
  terminal: 1
  tradeNo: string
}

export function payOrder(params: IPay) {
  return lsxmRequest.post(`${HOTEL_URL}/PaymentInfo/bdwpay`, params)
}

/**
 * @method 优惠券列表
 */
interface ICouponList {
  channelType: 1
  orderAmount: number
  shopId: string
  useNight: number
  codeOutside: string
}
export function getCouponList(params: ICouponList) {
  return lsxmRequest.post(`${HOTEL_URL}/coupon/list`, params)
}

/**
 * @method 最优优惠券
 */
interface IBestCoupon {
  channelType: 1
  orderAmount: number
  shopId: string
  useNight: number
  codeOutside: string
}
export function getBestCoupon(params: IBestCoupon) {
  return lsxmRequest.post(`${HOTEL_URL}/coupon/optimal`, params)
}

/**
 * @method 所有优惠券
 */
interface IAllCoupon {
  scenesId: 3
  status: number //0全部 1未使用 2已使用 3已失效
  pageNum: number // 第几页
  pageSize: number // 几条数据
}
export function getAllCoupon(params: IAllCoupon) {
  return lsxmRequest.get(
    `${VIP_URL}/cms/coupon/getUserCouponList`,
    {
      scenesId: params.scenesId,
      status: params.status,
    },
    {
      header: {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      },
    }
  )
}
