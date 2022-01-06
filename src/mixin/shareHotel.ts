export default {
  onShareAppMessage: (res: Page.ShareAppMessageOption) => {
    const userInfo = uni.getStorageSync('userInfo')
    const nickName = userInfo.nickName || ''
    let title = ''

    const id = uni.getStorageSync('roomData').hotelId
    if (res.from === 'button') {
      title = `${nickName} 给你分享了一张房卡`

      const hotelId = id

      // 分享给好友
      return {
        title: title,
        desc: '',
        path: `/modules/hotel/views/visitor/visitor?hotelId=${hotelId}`,
        imageUrl: '/static/hotel-static/hotelBg.jpg',
        content: '',
        query: `hotelId=${hotelId}`,
      }
    }

    if (nickName) {
      title = `${nickName} 邀请你进入百达屋空间`
    } else {
      title = '一起进入百达屋空间吧'
    }

    return {
      title: title,
      path: `/modules/hotel/views/bookHotel/BookHotel`,
      imageUrl: '/static/hotel-static/hotelBg.jpg',
    }
  },
}
