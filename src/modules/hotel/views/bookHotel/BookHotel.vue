<template>
  <view class="hotel_home">
    <Custom :need-back-icon="false">
      <template #content>
        <image class="logo" src="~@/static/home/logo.svg" mode="" />
      </template>
    </Custom>
    <Login
      v-model:need-login="needLogin"
      :source-type="3"
      @loginStatus="loginStatus"
    />
    <scroll-view
      class="home_scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="trigger"
      :style="{ height: `calc(100vh - ${customBar}px)` }"
      @refresherrefresh="pageRefresh"
    >
      <view class="home_select">
        <MySwiper
          v-if="banners.length"
          :images="banners.map((b) => b.picUrl)"
          showLeft
          swiperHeight="442rpx"
          bottomLength="78rpx"
          leftLength="80rpx"
          :showDots="banners.length > 1"
          dotSize="width:10rpx;height:10rpx;margin-right:8rpx;border-radius: 100%;background-color: rgba(255,255,255,0.7);"
          activeDotSize="width:20rpx;height:10rpx;margin-right:8rpx;border-radius: 4rpx;background-color: #fff;"
          @clickSwiperItem="clickSwiperItem"
        />

        <view class="choose_hotel_info">
          <view class="choose_item hotel_city">
            <text class="city_name" @click="toChooseCity">{{ city }}</text>
            <view class="my_address" @click="getMyCity">
              <image class="point" src="~@/static/common/point.svg" mode="" />
              <text>我的位置</text>
            </view>
          </view>

          <view class="choose_item hotel_date" @click="toChooseDate">
            <view class="date_info">
              <text class="date_detail">{{
                $day(date[0]).format('MM月DD日')
              }}</text>
              <text class="date_tip">{{ handleRestDate(date).inTip }}</text>
            </view>
            <text class="date_connect">{{ ' - ' }}</text>
            <view class="date_info">
              <text class="date_detail">{{
                $day(date[1]).format('MM月DD日')
              }}</text>
              <text class="date_tip">{{ handleRestDate(date).outTip }}</text>
            </view>
            <text class="night_count">共{{ count }}晚</text>
          </view>

          <view class="choose_item key_word" @click="toSearchHotel">
            搜索关键词、品牌名
          </view>

          <button class="find_btn" @click="toFind">找酒店</button>
        </view>
      </view>

      <view v-if="brands && brands.length" class="home_brands">
        <image
          class="brand_icon"
          src="~@/static/home/hotel-brands.png"
          mode=""
        />
        <BrandsList :brands="brands" />
      </view>

      <view v-if="promo && promo.length" class="home_activity">
        <image
          class="activity_icon"
          src="~@/static/home/activity.png"
          mode=""
        />
        <WonderfulActivity :list="promo" @needAuthToH5="needAuthToH5" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getBrandSwiper, getHotelBrands } from '@/api/hotel-api'
import MySwiper from '@/components/swiper/MySwiper.vue'
import Login from '@/components/login/Login.vue'
import WonderfulActivity from './components/WonderfulActivity.vue'
import BrandsList from './components/BrandsList.vue'
import { getScene } from '@/utils/util'
import Monitor from '@/utils/monitor.js'
import qqMap from '@/utils/qqmap-wx-jssdk1.2/qqmap-wx-jssdk'
const map = new qqMap({
  key: 'SMQBZ-SMOK5-HWUIN-QU4BQ-JGTYV-DIF3E',
})
let canChooseCity = true
let timer1 = null
let timer2 = null
const app = getApp()
export default {
  name: 'BookHotel',
  components: {
    MySwiper,
    WonderfulActivity,
    BrandsList,
    Login,
  },
  data() {
    return {
      customBar: app.globalData.customBar,
      banners: [],
      promo: [],
      brands: [],
      trigger: false,
      needLogin: false,
      link: '',
      isBanner: false,
      needLink: false,
    }
  },
  computed: {
    date() {
      return this.$store.state.list.date
    },
    city() {
      return this.$store.state.list.city || '杭州市'
    },
    count() {
      if (!this.date) return 0
      return parseInt((this.date[1] - this.date[0]) / (24 * 3600 * 1000))
    },
  },
  onShareAppMessage() {
    return {
      title: '百达屋酒店预订，致力于打造美好线下体验',
      path: '/modules/hotel/views/bookHotel/BookHotel',
    }
  },
  onLoad(options) {
    console.log(options)
    // 如果扫了房间的服务二维码
    if (options.scene) {
      console.log(getScene(options.scene))
      const query = getScene(options.scene)
      if (query.hotelId && query.roomNum) {
        this.$store.commit('service/setHotelId', query.hotelId)
        this.$store.commit('service/setRoomId', query.roomNum)
        uni.redirectTo({
          url: '/modules/hotel/views/room-service/RoomService',
        })
        return
      } else if (query.sId && query.aId) {
        // 如果扫了某个门店前台的二维码  把该用户标记门店发展人
        uni.setStorageSync('invitationId', query.userId)
        uni.setStorageSync('sId', query.sId)
        uni.setStorageSync('aId', query.aId)
        this.needLink = false
        this.needLogin = true
      }
    }
    // 如果扫了某个人的二维码  把该用户标记该用户的发展人
    if (options.userId) {
      uni.setStorageSync('invitationId', options.userId)
    }
    this.init()
    this._getUserAuth()
    this._getBrandSwiper()
    this._getAllBrands()
  },

  onShow() {
    timer1 = setTimeout(() => {
      this.customBar = app.globalData.customBar
    }, 500)
    Monitor.pageShow()
    // 防止用户未退出小程序  第二天重新打开
    const date = this.$store.state.list.date
    const nowDate = new Date().setHours(0, 0, 0, 0)
    if (date[0] < nowDate) {
      this.init()
    }
    const token = uni.getStorageSync('token')
    if (token) {
      this._getToken()
    }
  },

  onUnload() {
    timer1 && clearTimeout(timer1)
    timer2 && clearTimeout(timer2)
  },

  onHide() {
    timer1 && clearTimeout(timer1)
    timer2 && clearTimeout(timer2)
  },

  methods: {
    //下拉刷新
    pageRefresh() {
      this.trigger = true
      const date = this.$store.state.list.date
      const nowDate = new Date().setHours(0, 0, 0, 0)
      if (date[0] < nowDate) {
        this.init()
      }
      this._getUserAuth()
      this._getBrandSwiper()
      this._getAllBrands()
      timer2 = setTimeout(() => {
        this.trigger = false
      }, 800)
    },
    toFind() {
      this.$to('/modules/hotel/views/hotel-list/HotelList')
    },
    toChooseDate() {
      this.$to('/modules/hotel/views/calendar/Calendar')
    },
    toSearchHotel() {
      this.$to('/modules/hotel/views/search/SearchHotel')
    },
    toChooseCity() {
      this.$to('/modules/hotel/views/choose-city/ChooseCity')
    },

    // 获取品牌轮播图以及活动
    _getBrandSwiper() {
      const params = {
        scene: 2,
        channel: 2,
      }
      getBrandSwiper(params)
        .then((res) => {
          const { data, code } = res.data
          if (code === 200 && data) {
            this.banners = data.banner.map((item) => {
              return {
                id: item.id,
                isJumpLink: item.isJumpLink,
                picUrl: item.picUrl,
                link: item.link,
              }
            })
            this.promo = data.promo.map((item) => {
              return {
                content: item.content,
                id: item.id,
                isJumpLink: item.isJumpLink,
                link: item.link,
                picUrl: item.picUrl,
              }
            })
          }
        })
        .catch(() => {
          this.banners = []
          this.promo = []
        })
    },

    // 获取品牌酒店所有品牌
    _getAllBrands() {
      getHotelBrands(1)
        .then((res) => {
          const { code, data } = res.data
          if (code === 200 && data) {
            this.brands = data
            this.$store.commit('list/setBrands', data)
          }
        })
        .catch(() => {
          return uni.showToast({
            title: '获取品牌失败',
            icon: 'none',
            duration: 2000,
          })
        })
    },

    // 点击轮播
    clickSwiperItem(index) {
      // TODO: 可能会有问题
      if (!this.banners[index].isJumpLink) return
      const link = this.banners[index].link
      if (!link.includes('http')) {
        this.$to(`/modules/hotel/views/hotel-list/HotelList?brandId=${link}`)
        return
      }
      const token = uni.getStorageSync('token')
      if (token) {
        this.$to(
          `/modules/hotel/views/h5-link/H5Link?src=${link.split('?')[0]}&${
            link.split('?')[1]
          }&token=${encodeURIComponent(token)}`
        )
      } else {
        const params = {
          link,
          isBanner: false,
        }
        this.needAuthToH5(params)
      }
    },

    // 需要登录然后跳转h5
    needAuthToH5(val) {
      this.needLink = true
      this.link = val.link
      this.isBanner = val.isBanner
      this.needLogin = true
    },

    //loginStatus
    loginStatus(val) {
      if (val && val !== 'error') {
        if (!this.needLink) return
        this.$to(
          `/modules/hotel/views/h5-link/H5Link?src=${this.link.split('?')[0]}&${
            this.link.split('?')[1]
          }&token=${encodeURIComponent(val)}`
        )
      }
    },

    // 获取当前位置
    getMyCity() {
      if (!canChooseCity) return
      canChooseCity = false
      wx.getSetting({
        withSubscriptions: true,
        success: (settings) => {
          const locationAuth = settings.authSetting['scope.userLocation']
          if (locationAuth !== false) {
            this._getUserLocation()
            return
          }
          uni.showModal({
            title: '用户授权',
            content: `是否对百达屋授权您的定位信息`,
            success: (res) => {
              if (res.cancel) return
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userLocation'] === true) {
                    this._getUserLocation()
                  }
                },
              })
            },
            complete: () => {
              canChooseCity = true
            },
          })
        },
      })
    },

    // 用户进入初始化信息
    init() {
      uni.setStorageSync('brandType', 15)
      this.$store.commit('list/setDate', [
        new Date().setHours(0, 0, 0, 0),
        new Date().setHours(0, 0, 0, 0) + 24 * 3600 * 1000,
      ])
    },
    // 获取个人位置授权信息
    _getUserAuth() {
      wx.getSetting({
        withSubscriptions: true,
        success: (settings) => {
          const locationAuth = settings.authSetting['scope.userLocation']
          if ([true, false].includes(locationAuth)) {
            if (!locationAuth) return
            this._getUserLocation()
          }
        },
      })
    },

    // 获取用户个人位置信息
    _getUserLocation() {
      wx.getLocation({
        success: (res) => {
          // 地址逆解析
          console.log(res)
          map.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude,
            },
            success: (res) => {
              const city = res.result.address_component.city
              this.$store.commit('list/setCity', city)
              this.$store.commit('city/setCity', city)
            },
            fail: (err) => {
              uni.showToast({
                icon: 'none',
                title: err,
              })
            },
          })
        },
        fail: (err) => {
          console.log(err)
        },
        complete: () => {
          canChooseCity = true
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.hotel_home {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .logo {
    width: 186rpx;
    height: 30rpx;
  }
  .home_scroll {
    width: 100%;
    .home_select {
      position: relative;
      width: 100%;
      height: 812rpx;
      .choose_hotel_info {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 686rpx;
        height: 426rpx;
        // width: 590rpx;
        // height: 366rpx;
        padding: 24rpx 48rpx 36rpx;
        margin-left: -343rpx;
        background-color: #fff;
        border: 1px solid #ebebeb;
        border-radius: 22rpx;
        box-shadow: 0 6rpx 20rpx 0 rgba(24, 25, 35, 0.14);
        .choose_item {
          position: relative;
          width: 100%;
          height: 94rpx;
          @include flex-align;
          @include scale1px(#e6e6e6, bottom);
          &.hotel_city {
            justify-content: space-between;
            .city_name {
              flex: 1;
              height: 94rpx;
              font-size: 32rpx;
              font-weight: 400;
              line-height: 94rpx;
              color: #101010;
            }
            .my_address {
              height: 100%;
              @include flex-align;

              font-size: 24rpx;
              font-weight: 400;
              color: #101010;
              .point {
                width: 32rpx;
                height: 32rpx;
                margin-right: 8rpx;
              }
            }
          }
          &.hotel_date {
            justify-content: space-between;
            .date_info {
              display: flex;
              align-items: flex-end;
              .date_detail {
                font-size: 32rpx;
                font-weight: 400;
                color: #101010;
              }
              .date_tip {
                margin-left: 10rpx;
                font-size: 24rpx;
              }
            }
            .date_connect {
              margin: 0 10rpx;
            }
            .night_count {
              flex: 1;
              font-size: 24rpx;
              font-weight: 400;
              color: #999;
              text-align: right;
            }
          }
          &.key_word {
            font-size: 28rpx;
            font-weight: 400;
            color: #ccc;
            &::after {
              content: none;
            }
          }
        }
        .find_btn {
          width: 100%;
          height: 80rpx;
          @include flex-center;

          margin: 0;
          font-size: 30rpx;
          font-weight: 400;
          color: #fff;
          background: #da1a23;
          border-radius: 8rpx;
        }
      }
    }

    .home_brands {
      width: 100%;
      padding: 72rpx 20rpx 46rpx;
      text-align: center;
      .brand_icon {
        width: 152rpx;
        height: 28rpx;
      }
    }

    .home_activity {
      width: 100vw;
      text-align: center;
      .activity_icon {
        width: 210rpx;
        height: 30rpx;
      }
    }
  }
}
</style>
