import { MiniAppType } from '@/config/enum'
import LsxmRequest from './LsxmRequest'
import qs from 'qs'

const lsxmRequest = new LsxmRequest()

// 请求拦截器
lsxmRequest.interceptors.request((request: any) => {
  const token = uni.getStorageSync('token')
  if (request.method === 'GET' && request.data.brandIds instanceof Array) {
    request.data = qs.stringify(request.data, {
      arrayFormat: 'repeat',
    })
    request.url = request.url + '?' + request.data
  }
  if (token) {
    request.header['Authorization'] = 'Bearer ' + token
    request.header['type'] = MiniAppType.hotel
  }
  if (request.header.contentType) {
    request.header['content-type'] = 'application/x-www-form-urlencoded'
  }

  let loading = true
  // uni.hideLoading()
  if (request.header.noLoading) {
    loading = false
  }
  // if (loading) {
  //   uni.showLoading({
  //     title: '加载中',
  //   })
  // }
  return request
})

// 响应拦截器
lsxmRequest.interceptors.response((response: any) => {
  // uni.hideLoading()
  const token = uni.getStorageSync('token')
  if (response.data.code === 403) {
    uni.showToast({
      title: token ? '请重新登录' : '请先登录',
      icon: 'none',
      duration: 2000,
    })
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  if (response.data.code === 1) response.data.code = 200
  return response
})

// 设置默认配置
lsxmRequest.setConfig((config: any) => {
  if (uni.getStorageSync('token')) {
    config.header['Authorization'] = 'Bearer ' + uni.getStorageSync('token')
    config.header['type'] = MiniAppType.member // 会员0  龙腾1  剧本杀2  酒店3
  }
  return config
})

export default lsxmRequest
