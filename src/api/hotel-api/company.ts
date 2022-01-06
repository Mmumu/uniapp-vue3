import lsxmRequest from '@/plugins/request'
import { HOTEL_URL } from '@/config'

/**
 * @method 搜索公司
 * @param { string } keyword 关键词
 */
export function searchCompany(keyword: string) {
  return lsxmRequest.get(
    `${HOTEL_URL}/client/queryAllByKeyword`,
    {
      keyword: keyword,
    },
    {
      header: {
        noLoading: 1,
      },
    }
  )
}

/**
 * @method 查询认证状态  0有效 1失效 2审核中
 */
export function getAuthStatus() {
  return lsxmRequest.get(`${HOTEL_URL}/client/queryAuthenticationStatus`)
}

/**
 * @method 认证
 * @param { string } clientName 用户姓名
 * @param { string } personalMail 用户邮箱
 * @param { string } enterpriseId 公司id
 * @param { string } enterpriseName 公司名
 * @param { string } phone 用户手机号
 * @param { string } vipNo 会员号
 */
export function postAuth({
  clientName,
  personalMail,
  enterpriseId,
  enterpriseName,
  phone,
  vipNo,
}: any) {
  return lsxmRequest.post(`${HOTEL_URL}/client/commitAuthentication`, {
    clientName,
    personalMail,
    enterpriseId,
    enterpriseName,
    phone,
    vipNo,
  })
}

/**
 * @method 重新发送邮件
 */

export function postEmailAgain() {
  return lsxmRequest.post(`${HOTEL_URL}/client/reSendEmail`)
}
