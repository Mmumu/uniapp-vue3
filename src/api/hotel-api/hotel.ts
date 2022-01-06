import lsxmRequest from '@/plugins/request'
import { HOTEL_URL, APP_URL, VIP_URL } from '@/config'

/**
 * @method 获取符合条件的酒店列表
 * @param { array } brandIds// 品牌id
 * @param { string } dateStart // 开始入住日期
 * @param { string } dateEnd // 结束日期
 * @param { number } pageSize // 分页
 * @param { number } pageNum // 分页
 * @param { string } destination // 城市 比如: '深圳市'
 * @param { number } orderType // 排序方式 0 低价 1 高价
 * @param { array} serviceType // 服务类型 酒店小程序只传['3']
 * @param { string} storeName // 搜索?
 */
interface IStoreList {
  brandIds: string[]
  dateStart: string
  dateEnd: string
  pageSize: number
  pageNum: number
  destination: string
  orderType: number
  serviceType: string[]
  storeName: string
}
export function getHotelListApp(params: IStoreList) {
  return lsxmRequest.post(
    `${APP_URL}/store/list`,
    {
      brandIds: params.brandIds,
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      destination: params.destination,
      orderType: params.orderType,
      serviceType: params.serviceType,
      storeName: params.storeName,
    },
    {
      header: {
        noLoading: 1,
        pageSize: params.pageSize,
        pageNum: params.pageNum,
      },
    }
  )
}

/**
 * @method 根据关键词进行搜索
 * @param { string } keyword // 关键词
 */
export function getKeyWordHotel(keyword: string) {
  return lsxmRequest.get(
    `${APP_URL}/store/keywordSearch`,
    {
      keyword,
    },
    {
      header: {
        noLoading: 1,
      },
    }
  )
}

/**
 * @method 获取酒店详情
 * @param { string } id // 酒店id
 * @param { string } dateStart // 到达时间
 * @param { string | number } dateEnd // 结束时间
 */
export function getHotelInfo({ id, dateStart, dateEnd }: any) {
  return lsxmRequest.get(
    `${HOTEL_URL}/tower/hotel/listHotelItemVO`,
    {
      hotelId: id,
      dateStart,
      dateEnd,
    },
    {
      header: {
        noLoading: 1,
      },
    }
  )
}

/**
 * @method 获取入住人列表
 */
export function getHotelUserList() {
  return lsxmRequest.get(`${HOTEL_URL}/person/list`)
}

/**
 * @method 添加入住人
 * @param { string } email 邮箱
 * @param { string } nickName 姓名
 * @param { string } idNo 身份证号
 * @param { string } idType 证件类型
 * @param { number } isDefault 是否默认
 * @param { string } phone 手机号
 */
export function addHotelUser({
  email,
  nickName,
  idNo,
  idType,
  isDefault,
  phone,
}: any) {
  return lsxmRequest.post(`${HOTEL_URL}/person/add`, {
    email,
    nickName,
    idNo,
    idType,
    isDefault,
    phone,
    type: 0,
  })
}

/**
 * @method 删除入住人
 * @param {string} ids 要删除的id
 */
export function deleteHotelUser(ids: string) {
  return lsxmRequest.get(`${HOTEL_URL}/person/remove`, {
    ids,
  })
}

export function getHotelDetailNotice(id: string) {
  return lsxmRequest.get(
    `${VIP_URL}/hotel-manage/facilityInfo/getFacilityInfo?hotelId=${id}`
  )
}

/**
 * @method 修改入住人
 * @param { string } id 用户id
 * @param { string } email 邮箱
 * @param { string } nickName 姓名
 * @param { string } idNo 身份证号
 * @param { string } idType 证件类型
 * @param { number } isDefault 是否默认
 * @param { string } phone 手机号
 */
export function updateHotelUser({
  id,
  email,
  nickName,
  idNo,
  idType,
  isDefault,
  phone,
}: any) {
  return lsxmRequest.post(`${HOTEL_URL}/person/edit`, {
    id,
    email,
    nickName,
    idNo,
    idType,
    isDefault,
    phone,
  })
}

/**
 * @method 获取已预订的卡片
 */
export const getAllCards = () => {
  return lsxmRequest.get(`${HOTEL_URL}/OrderMain/listServiceCard`)
}

/**
 * @method 获取酒店信息
 */
export const getHotelInfoByHotelId = (id: string) => {
  return lsxmRequest.get(
    `${VIP_URL}/hotel/tower/hotel/getHotelInfoByHotelId?hotelId=${id}`
  )
}
