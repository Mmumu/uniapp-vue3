import uma from 'umtrack-wx'

uma.init({
  appKey: '60f7f0542a1a2a58e7e01ed7',
  useOpenid: true, // 是否使用openid进行统计，此项为false时将使用友盟+随机ID进行用户统计。使用openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用OpenID。
  autoGetOpenid: false, // 是否需要通过友盟后台获取openid，如若需要，请到友盟后台设置appId及secret
  debug: false, //是否打开调试模式
  uploadUserInfo: true, // 自动上传用户信息，设为false取消上传，默认为false
})

uma.install = function (Vue: any) {
  // Vue.prototype.$uma = uma
  Vue.config.globalProperties.$uma = uma
}

export default uma
