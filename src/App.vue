import { onLaunch } from '@dcloudio/uni-app';
 <script lang="ts">
import { tiny } from '@/tiny/tiny'
import { refreshToken } from '@/api/common-api'
// const app = getApp()
 export default {
  globalData: {
    statusBar: 0,
    custom: {},
    customBar: 0,
  },
  onLaunch() {
    // console.log(app, "appLaunch~~~")
    uni.setStorageSync('token', '93272abf-8aff-41b1-b657-4a5bd8fc4e61')
    console.log(this, 'onLaunch~~~')
    const token = uni.getStorageSync('token')
    token && refreshToken()

    tiny.init({
      isMiniProgram: true,
    })
    // 获取小程序信息
    const appInfo = wx.getAccountInfoSync()
    uni.setStorageSync('appId', appInfo.miniProgram.appId)
    uni.setStorageSync('brandType', 15)
    uni.setStorageSync('isLeave', 0)
    let count = 0
    const getSystem = () => {
      if (count === 3) return
      count += 1
      wx.getSystemInfo({
        success: (res: any) => {
          console.log(res, 'getSystemInfo成功')
          let menuButtonInfo = uni.getMenuButtonBoundingClientRect()
          this.globalData.statusBar = res.statusBarHeight
          if (menuButtonInfo) {
            this.globalData.custom = menuButtonInfo
            this.globalData.customBar =
              menuButtonInfo.bottom + menuButtonInfo.top - res.statusBarHeight
          } else {
            this.globalData.customBar = res.statusBarHeight + 40
          }
          console.log(this.globalData, 'getSystemInfo成功!!!!!')
        },
        fail: () => {
          getSystem()
        },
      })
    }
    getSystem()
  }
}
 </script>
<style></style>
