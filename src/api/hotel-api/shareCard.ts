/* 酒店分发房卡接口 */
import lsxmRequest from '@/plugins/request'
import { HOTEL_URL } from '@/config'

/**
 * @method 获取房间密码
 * @param { string } pid       // 房卡的来源
 * @param { string } phone     // 访客的手机号码
 * @param { string } orderNo   // 房卡的订单号
 * @param { string } roomId    // 房间号
 * @param { string } startTime // 房卡开始有效时间
 * @param { string } endTime   // 房卡开始失效时间
 * @param { string } hotelId   // 酒店id
 * @param { number } count     // 使用次数
 */
export function addVisitorCard(data: any) {
  return lsxmRequest.post(`${HOTEL_URL}/eroomcard/addVisitorCard`, data)
}

/**
 * @method 获取该房间分配的房卡
 * @param { string } pid       // 房卡的来源, 房卡id
 * @param { string } phone     // 手机号码,非必传
 */
export function getVisitCard(data: any) {
  return lsxmRequest.get(`${HOTEL_URL}/eroomcard/listVisitorCard`, data)
}

/**
 * @method 修改分发的房卡
 * @param { string } id       // 房卡的来源, 房卡id
 */
export function updateVisitCard(data: any) {
  return lsxmRequest.post(`${HOTEL_URL}/eroomcard/update`, data)
}

/**
 * @method 获取单个房卡信息
 * @param { string } id       // 房卡的来源, 房卡id
 */
export function getCardById(data: any) {
  return lsxmRequest.post(`${HOTEL_URL}/eroomcard/getById`, data)
}
