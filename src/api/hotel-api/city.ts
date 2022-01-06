import lsxmRequest from '@/plugins/request'
import { APP_URL } from '@/config'

/**
 * @method 获取城市列表
 */
export function getAllCity() {
  return lsxmRequest.get(`${APP_URL}/index/city/list`)
}
