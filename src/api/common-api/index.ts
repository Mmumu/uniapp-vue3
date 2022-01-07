import lsxmRequest from '@/plugins/request'
import { VIP_URL, BDW_USER_URL } from '@/config'
console.log(VIP_URL, "VIP_URL")
console.log(BDW_USER_URL, "BDW_USER_URL")
/**
 * @method 重新刷新登录token
 */
export function refreshToken() {
  return lsxmRequest.post(`/bdw-auth/refresh`)
}

/**
 * @method 解析code获取openId(会员)
 * @param { string } code // 小程序登录的code
 * @param { string } appId // 登录type 0. 会员 1. 龙腾 2. 剧本杀 3. 酒店
 */
export function getVipOpenId(code: string, appId: string) {
  return lsxmRequest.get(`${VIP_URL}/weixin/wx/user/${appId}/login`, {
    code,
    appid: appId,
  })
}

/**
 * @method 用户登录(会员)
 * @param { string } username // openId
 * @param { string } password // seeion_key
 * @param { number } sourceType  // 0. 会员 1. 龙腾 2. 剧本杀 3. 酒店
 * @param { number } brandType // 品牌 5代表酒店默认
 */
export function vipLogin({ username, password, sourceType, brandType }: any) {
  return lsxmRequest.post(`${VIP_URL}/auth/login`, {
    username,
    password,
    sourceType,
    brandType,
  })
}

/**
 * @method 获取用户信息(会员)
 * @param { string } type // 0. 会员 1. 龙腾 2. 剧本杀 3. 酒店
 * @param { string } openId // openId
 * @param { number } brandType
 */
export function getVipInfo({ type, openId, brandType }: any) {
  const params: any = {
    sourceType: type,
    openId,
  }
  if (brandType) params.brandType = brandType
  return lsxmRequest.get(`${BDW_USER_URL}/user/getUserByMinappOpenId`, params)
}

/**
 * @method 注册用户信息(会员)
 * @param { string } sourceType // 进入类型0. 会员 1. 龙腾 2. 剧本杀 3. 酒店
 * @param { string } minappOpenId // openId
 * @param { string } phone // 电话号码
 * @param { string } nickName // 昵称
 * @param { string } unionId // unionId
 * @param { string } avatarUrl // 头像
 * @param { string } isWebSysAdd // 是否后台添加
 * @param { string | number } gender // 性别
 * @param { number } subscribe // 是否关注服务号
 * @param { string } userId // 推荐人id
 * @param { number } addType // 注册来源 1 小程序, 2 web后台 3 app 4 官网
 * @param { number } channelType // 1 官方渠道
 * @param { number } shopId // 门店id
 * @param { string } activityId // 活动id
 */
export function addVipInfo({
  sourceType,
  brandType,
  minappOpenId,
  phone,
  nickName,
  unionId,
  avatarUrl,
  isWebSysAdd,
  gender,
  subscribe,
  userId,
  sId,
  aId,
}: any) {
  const params: any = {
    sourceType,
    minappOpenId,
    phone,
    nickName,
    unionId,
    avatarUrl,
    isWebSysAdd,
    gender,
    subscribe,
    addType: 1,
    channelType: 1,
  }
  if (brandType) params.brandType = brandType
  if (userId) params.userId = userId
  if (sId) params.shopId = sId
  if (aId) params.activityId = aId
  return lsxmRequest.post(`${BDW_USER_URL}/user/add`, params)
}

/**
 * @method 修改用户信息(会员)
 * @param { string } id 用户id
 * @param { string } sourceType // 进入类型0. 会员 1. 龙腾 2. 剧本杀 3. 酒店
 * @param { string } minappOpenId // openId
 * @param { string } phone // 电话号码
 * @param { string } nickName // 昵称
 * @param { string } userName // 真实姓名
 * @param { string } idCard  // 证件号
 * @param { string } email // 邮箱
 * @param { string } job // 职业
 * @param { string } birthday // 生日
 * @param { string } unionId // unionId
 * @param { string } avatarUrl // 头像
 * @param { number } avatarType // 头像来源 0 微信授权 1 自助修改
 * @param { string } isWebSysAdd // 是否后台添加
 * @param { string | number } gender // 性别
 * @param { number } subscribe // 是否关注服务号
 */
export function updateVipInfo(params: any) {
  return lsxmRequest.post(`${BDW_USER_URL}/user/update`, {
    ...params,
  })
}

/**
 * @method 获取会员等级
 */

export function getVipLevel() {
  return lsxmRequest.get(
    `${BDW_USER_URL}/memberTimeConsumeTimesScoreLevel/queryMemberConsumeTimesRuleByMemberIdOrPhone`
  )
}
