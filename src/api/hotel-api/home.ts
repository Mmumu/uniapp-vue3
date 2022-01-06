import lsxmRequest from '@/plugins/request'
import { APP_URL, CMS_URL } from '@/config'

/**
 * @method 查询品牌轮播以及活动
 */
interface IBrandSwiper {
  scene: number // 1休息厅2剧本杀3酒店
  channel: number // 1小程序2APP3WEB
}
export function getBrandSwiper(params: IBrandSwiper) {
  return lsxmRequest.get(`${CMS_URL}/index/getBannerAndPromo`, params)
}

/**
 * @method 查询首页酒店品牌
 */
export function getHotelBrands(channel: number) {
  return lsxmRequest.get(`${APP_URL}/index/brand/list`, {
    channel,
  })
}
