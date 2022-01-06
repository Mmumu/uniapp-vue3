import { isBrowserSupportWebp } from './isBrowserSupportWebp'
import { isWechatSupportWebp } from './isWechatSupportWebp'

let _globalThis: any

const isProd = process.env.NODE_ENV === 'production'
console.info(`[tiny]`, 'isProd', isProd)

interface UrlOptions {
  quality?: number
  width?: number
}

const defaultOptions: UrlOptions = {
  quality: 90,
  width: 750,
}

export function tinyUrl(url: string, options?: UrlOptions) {
  if (!url || url === '' || url.includes('null')) {
    if (!isProd) {
      console.warn(`[tiny]`, `url is null`, url)
      // TODO: 日志上报
    }
    return 'https://img.betterwood.com/default.png'
  }

  // TODO: 后台统一处理后去掉
  url = hackKaiyuan(url)
  url = hackKaiyuanUpload(url)

  // TODO: 后台统一处理后去掉
  url = hackHttp(url)

  url = minify(url, options)

  return url
}

function hackKaiyuan(url: string) {
  if (url.includes('oss.kaiyuanhotels.com')) {
    if (!isProd) {
      console.warn(`[tiny]`, `hackKaiyuan`, url)
      // TODO: 日志上报
    }

    url = url.replace('oss.kaiyuanhotels.com', 'img.betterwood.com')

    if (!url.includes('https')) {
      url = url.replace('http', 'https')
    }
  }
  return url
}

function hackKaiyuanUpload(url: string) {
  if (url.includes('upload.shands.cn')) {
    if (!isProd) {
      console.warn(`[tiny]`, `hackKaiyuan`, url)
      // TODO: 日志上报
    }

    url = url.replace('upload.shands.cn', 'img.betterwood.com')

    if (!url.includes('https')) {
      url = url.replace('http', 'https')
    }
  }
  return url
}

function hackHttp(url: string) {
  if (url.includes('http://')) {
    if (!isProd) {
      console.warn(`[tiny]`, `hackHttp`, url)
      // TODO: 日志上报
    }

    url = url.replace('http://', 'https://')
  }
  return url
}

function minify(url: string, options?: UrlOptions) {
  if (url.includes('data:image/png;base64,')) return url

  if (!url.includes('?')) {
    // # 合并选项
    const mergeOptions: UrlOptions = options
      ? Object.assign({}, defaultOptions, options)
      : defaultOptions

    let resizeStr = ''
    if (mergeOptions?.width) {
      resizeStr = `/resize,m_mfit${
        mergeOptions?.width ? ',w_' + mergeOptions!.width! * pixelRatio : ''
      }`
    }

    url += `?x-oss-process=image/quality,Q_${
      mergeOptions.quality
    }${resizeStr}/format,${_globalThis.isSupportWebp ? 'webp' : 'jpg'}`
  }

  return url
}

async function init(options: { isMiniProgram: boolean }) {
  console.log(`[tiny] check isSupportWebp...`)
  if (options.isMiniProgram) {
    _globalThis = wx
    _globalThis.isSupportWebp = isWechatSupportWebp()
  } else {
    _globalThis = window
    _globalThis.isSupportWebp = await isBrowserSupportWebp()
  }
  console.log(`[tiny] isSupportWebp:${_globalThis.isSupportWebp}`)
}

function setQuality(quality: number) {
  defaultOptions.quality = quality
}

function setPixelRatio(ratio: number) {
  pixelRatio = ratio
}

let pixelRatio = 1

export const tiny = {
  init,
  tinyUrl,
  setPixelRatio,
  setQuality,
}

declare const wx: any
