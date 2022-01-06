import { baseUrl } from '../../config'
import Monitor from '../../utils/monitor'

const config = Symbol('config')
const isCompleteURL = Symbol('isCompleteURL')
const requestBefore = Symbol('requestBefore')
const requestAfter = Symbol('requestAfter')

class LsxmRequest {
  //默认配置
  [config]: UniApp.RequestOptions = {
    url: '',
    header: {
      'content-type': 'application/json',
    },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
  }

  // 拦截器
  interceptors = {
    request: (func: Fn) => {
      if (func) {
        LsxmRequest[requestBefore] = func
      } else {
        LsxmRequest[requestBefore] = (request) => request
      }
    },
    response: (func: Fn) => {
      if (func) {
        LsxmRequest[requestAfter] = func
      } else {
        LsxmRequest[requestAfter] = (response) => response
      }
    },
  }

  static [requestBefore](config: UniApp.RequestOptions) {
    return config
  }

  static [requestAfter](response: any) {
    return response
  }

  static [isCompleteURL](url: string) {
    return /(http|https):\/\/([\w.]+\/?)\S*/.test(url)
  }

  request(options: UniApp.RequestOptions & { baseURL?: string }) {
    const TraceID = Monitor.getTraceId('EagleEye-TraceID')['EagleEye-TraceID']
    const baseURL = options.baseURL || baseUrl
    options.url = LsxmRequest[isCompleteURL](options.url)
      ? options.url
      : baseURL + options.url
    options.method = options.method || this[config].method
    options.dataType = options.dataType || this[config].dataType
    options.header = {
      ...options.header,
      ...this[config].header,
      'EagleEye-TraceID': TraceID,
    }
    const time = Date.now()

    options = { ...options, ...LsxmRequest[requestBefore](options) }

    return new Promise((resolve, reject) => {
      options.success = function (res) {
        Monitor.api(
          options.url,
          true,
          Date.now() - time,
          (res.data as any).code,
          (res.data as any).msg,
          time,
          TraceID
        )
        resolve(LsxmRequest[requestAfter](res))
      }
      options.fail = function (err) {
        Monitor.api(
          options.url,
          false,
          Date.now() - time,
          'ERROR',
          (err as any).data?.message,
          time,
          TraceID
        )
        reject(LsxmRequest[requestAfter](err))
      }
      uni.request(options)
    })
  }

  get(url: string, data: any = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'GET' })
  }

  post(url: string, data: any = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'POST' })
  }

  put(url: string, data: any = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'PUT' })
  }

  delete(url: string, data: any = {}, options: Recordable = {}) {
    return this.request({ ...options, url, data, method: 'DELETE' })
  }

  getConfig() {
    return this[config]
  }

  setConfig(func: Fn) {
    this[config] = func(this[config])
  }
}

export default LsxmRequest
