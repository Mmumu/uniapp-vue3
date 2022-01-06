// import { VueConstructor } from 'vue/types/umd'

/**
 * 方法
 */
const pageType: Record<Methods.ToPageType, Methods.ToPageFunc> = {
  to: 'navigateTo',
  back: 'navigateBack',
  redirect: 'redirectTo',
  reLaunch: 'reLaunch',
  switchTab: 'switchTab',
  preload: 'preloadPage',
}

/**
 *  跳转页面方法
 * @param path 路径
 * @param type type
 */
const toPage: Methods.ToPage = (path, type = 'to') => {
  let pagePathConfig: any

  if (typeof path === 'object') {
    //如果传入为object 则直接执行跳转方法
    pagePathConfig = path
  } else if (path === 'back') {
    //如果path为back
    type = 'back'
    pagePathConfig = {
      delta: -1,
    }
  } else if (type === 'back') {
    //如果type为back
    pagePathConfig = {
      delta: path,
    }
  } else {
    // 如果传递为string 跳转方式为配置
    //微信小程序有几率超出页面十级失败 所以失败使用不保留跳转
    pagePathConfig = {
      url: path,
      fail: () => {
        //二次跳转
        uni[pageType['redirect']]({
          url: 'path',
        })
      },
    }
  }
  //跳转
  uni[pageType[type]](pagePathConfig)
}

export default {
  install(app: any) {
    /** 路由跳转 */
    app.config.globalProperties.$to = toPage
  },
}
