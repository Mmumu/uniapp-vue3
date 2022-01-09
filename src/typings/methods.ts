import { Store } from 'vuex'
import { StoreData } from '@/store/index'

declare global {
  namespace Methods {
    /**
     * 跳转路由方式
     * to: 普通跳转
     * back:返回
     * redirect:不记录当前页面
     * reLaunch:清空所有页面
     * switchTab:跳转到tab页面
     */
    export type ToPageType =
      | 'to'
      | 'back'
      | 'redirect'
      | 'reLaunch'
      | 'switchTab'
      | 'preload'

    //回调函数以及默认参数
    type callBackFunc = {
      /** 需要跳转的应用内非 tabBar 的页面的路径，路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 'path?key=value&key2=value2' */
      url: string
      /** 接口调用成功的回调函数 */
      success?: () => {}
      /** 接口调用失败的回调函数 */
      fail?: () => {}
      /** 接口调用结束的回调函数（调用成功、失败都会执行） */
      complete?: () => {}
    }

    //参数
    type toPagePath =
      | ({
          /** 窗口显示的动画 */
          animationType?: string
          /** 窗口动画持续时间，单位为 ms */
          animationDuration?: string
          /** 页面间通信接口，用于监听被打开页面发送到当前页面的数据。2.8.9+ 开始支持。 */
          events?: string
        } & callBackFunc)
      | callBackFunc
      | {
          /** 返回的页面数，如果 delta 大于现有页面数，则返回到首页。	 */
          delta: number
          /** 窗口关闭的动画效果 */
          animationType: string
          /** 窗口关闭动画的持续时间，单位为 ms */
          animationDuration: number
        }
      | 'back'
      | string
      | number
      | {
          /** 路径 */
          url: string
          /** 最终执行 */
          complete: () => {}
          /** 失败回调 */
          fail: () => {}
        }

    //跳转方法
    export type ToPageFunc =
      | 'navigateBack'
      | 'navigateTo'
      | 'redirectTo'
      | 'reLaunch'
      | 'switchTab'
      | 'preloadPage'

    //跳转页面
    export type ToPage = (path: toPagePath, type?: ToPageType) => void
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    /** 跳转页面方法 */
    $to: Methods.ToPage
    /** 跳转页面方法 */
    $s: Store<StoreData>
  }
}
