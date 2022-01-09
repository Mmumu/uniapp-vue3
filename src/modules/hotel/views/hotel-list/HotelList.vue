<template>
  <view class="hotel_list">
    <Custom>
      <template #content>门店列表</template>
    </Custom>
    <scroll-view
      :scroll-y="canScroll"
      :style="{ height: `calc(100vh - ${customBar}px)` }"
      lower-threshold="100"
      enable-back-to-top
      @scrolltolower="_loadHotelList"
      @scroll="listScroll($event)"
    >
      <view class="search_title">
        <image
          class="title_img"
          :style="imgOpacity"
          src="~@/static/common/welist-title.jpg"
          mode=""
        />
        <view class="search_list" :style="fixedStyle">
          <view class="search_type">
            <view class="type_item city" @click="toChooseCity">
              <text class="text_content">{{ city || '杭州市' }}</text>
              <image
                class="city_icon"
                src="~@/static/common/right-grey.svg"
                mode=""
              />
            </view>
            <view class="type_item date" @click="toChooseDate">{{
              chooseDate
            }}</view>
            <view class="type_item search">
              <image
                class="search_icon"
                src="~@/static/common/search.svg"
                mode=""
              />
              <text
                class="text_content"
                :class="{ placeholder: !keyWord }"
                @click="toSearchHotel"
              >
                {{ '关键词' }}
              </text>
            </view>
          </view>
          <view class="sort_list">
            <view class="list_title">
              <view
                v-for="item in sortTypes"
                :key="item"
                class="title_item"
                @click="setSortType(item)"
              >
                <text
                  v-if="item === 'brand'"
                  class="type_text"
                  :class="{ active: sortType === item }"
                >
                  品牌：{{ brandsName }}
                </text>
                <image
                  class="type_icon"
                  :src="item === sortType ? activeDownIcon : downIcon"
                  mode=""
                />
              </view>
            </view>

            <view
              v-if="showSortDetail"
              class="type_list"
              :style="{ height: `calc(100vh - 356rpx)` }"
            >
              <view v-if="sortList && sortList.length" class="sort_wrapper">
                <view class="item_wrapper">
                  <block v-for="i in sortList" :key="i.brandId">
                    <view
                      class="list_item"
                      :class="{ choose: selectBrand.includes(i.brandId) }"
                      @click="toSelect(i.brandId)"
                      >{{ i.brandName }}
                    </view>
                  </block>
                </view>
                <view class="sort_btn">
                  <button
                    class="btn reset"
                    :class="{ disable: selectBrand.includes('all') }"
                    @click="toReset"
                  >
                    重置
                  </button>
                  <button class="btn sure" @click="sureToFind">确定</button>
                </view>
              </view>
              <div class="mask" @click="toCloseSortList"></div>
            </view>
          </view>
        </view>
      </view>

      <scroll-view
        v-if="hotelList.length"
        :refresher-enabled="canRefresh"
        :refresher-triggered="trigger"
        :scroll-y="false"
        class="store_list"
        @refresherrefresh="pageRefresh"
      >
        <block v-for="hotel in hotelList" :key="hotel.id">
          <HotelItem :hotel-item="hotel" />
        </block>
        <view v-if="finished" class="finished_text">—— 已经到底部了 ——</view>
      </scroll-view>

      <view
        v-else
        class="no_hotel"
        :style="{
          height: `calc(100vh - ${customBar}px - 356rpx)`,
        }"
      >
        <image class="no_image" src="~@/static/common/no-hotel.svg" mode="" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getHotelListApp } from '@/api/hotel-api'
import HotelItem from './components/HotelItem.vue'
import Monitor from '@/utils/monitor.js'
const app = getApp()
let timer = null
export default {
  name: 'HotelList',
  components: {
    HotelItem,
  },
  data() {
    return {
      customBar: app.globalData.customBar,
      sortType: '',
      canScroll: true,
      showSortDetail: false,
      fixedStyle: '',
      imgOpacity: 1,
      selectBrand: ['all'],
      defaultBrand: [],
      sortTypes: ['brand'],
      finished: false,
      pageNum: 1,
      total: 0,
      hotelList: [],
      trigger: false, // 是否下拉刷新
      canRefresh: true,
    }
  },
  computed: {
    chooseDate() {
      const date = this.$store.state.list.date
      return (
        this.$day(date[0]).format('MM-DD') +
        '至' +
        this.$day(date[1]).format('MM-DD')
      )
    },
    city() {
      return this.$store.state.list.city
    },
    sortList() {
      if (!this.selectBrand.length) return []
      const arr = this.$store.state.list.brands.map((item) => {
        return {
          brandName: item.name,
          brandId: item.id + '',
        }
      })
      arr.unshift({
        brandName: '全部',
        brandId: 'all',
      })
      return arr
    },
    brandsName() {
      if (!this.defaultBrand.length || !this.sortList.length) return ''
      let arr = []
      for (let i of this.defaultBrand) {
        const name = this.sortList.find(
          (item) => item.brandId + '' === i
        )?.brandName
        arr.push(name)
      }
      return arr.length > 1 ? arr.join(',') : arr.join('')
    },
    downIcon() {
      return require('@/static/common/down.png')
    },
    activeDownIcon() {
      return require('@/static/common/down-active.svg')
    },
  },

  watch: {
    showSortDetail(val) {
      this.canScroll = !val
    },
    chooseDate() {
      this.commonClear()
      this._getHotelList()
    },
    city() {
      this.commonClear()
      this._getHotelList()
    },
  },

  onLoad(options) {
    this.selectBrand = options.brandId ? [options.brandId] : ['all']
    this.defaultBrand = options.brandId ? [options.brandId] : ['all']
    this._getHotelList()
  },

  onShow() {
    Monitor.pageShow()
  },

  onHide() {
    timer && clearTimeout(timer)
  },

  onUnload() {
    timer && clearTimeout(timer)
  },

  methods: {
    // 下拉刷新
    pageRefresh() {
      console.log('下拉')
      this.trigger = true
      this.commonClear()
      this._getHotelList()
      timer = setTimeout(() => {
        this.trigger = false
      }, 1000)
    },
    setSortType(type) {
      if (type === this.sortType) {
        this.sortType = ''
        this.showSortDetail = false
      } else {
        this.sortType = type
        this.showSortDetail = true
      }
    },

    // 关闭排序
    toCloseSortList() {
      this.sortType = ''
      this.selectBrand = JSON.parse(JSON.stringify(this.defaultBrand))
      this.showSortDetail = false
    },

    // 重置选项
    toReset() {
      if (this.selectBrand.includes('all')) return
      this.selectBrand = ['all']
      // this.defaultBrand = ['all']
      // this.sortType = ''
      // this.showSortDetail = false
      // this.commonClear()
      // this._getHotelList()
    },

    // 确认选项
    sureToFind() {
      this.defaultBrand = JSON.parse(JSON.stringify(this.selectBrand))
      this.sortType = ''
      this.showSortDetail = false
      this.commonClear()
      this._getHotelList()
    },

    //加载酒店
    _loadHotelList() {
      if (this.hotelList.length === this.total) {
        this.finished = true
        return
      }
      this.pageNum += 1
      this._getHotelList(true)
    },

    // 选择日历
    toChooseDate() {
      this.$to('/modules/hotel/views/calendar/Calendar')
    },

    // 搜索酒店
    toSearchHotel() {
      this.$to('/modules/hotel/views/search/SearchHotel')
    },

    // 选择城市
    toChooseCity() {
      this.$to('/modules/hotel/views/choose-city/ChooseCity')
    },

    // 去选择
    toSelect(id) {
      if (id === 'all') {
        this.selectBrand = ['all']
      }
      if (this.selectBrand.includes(id)) {
        if (this.selectBrand.length === 1) return
        this.selectBrand = this.selectBrand.filter((item) => item !== id)
      } else {
        const arr = this.selectBrand.filter((item) => item !== 'all')
        arr.push(id)
        this.selectBrand = arr
      }
    },

    // 滑动
    listScroll(e) {
      if (e.detail.scrollTop > 0) {
        this.canRefresh = false
      } else {
        this.canRefresh = true
      }
      if (Math.ceil(e.detail.scrollTop) > 64) {
        this.fixedStyle = `height: 212rpx; position: fixed; top: ${this.customBar}px; z-index: 99; background-color: #F7F7F9; padding-top: 16rpx`
      } else {
        this.fixedStyle = ''
        this.imgOpacity = `opacity: ${1 - Math.ceil(e.detail.scrollTop) / 64}`
      }
    },

    // 获取符合条件的酒店
    _getHotelList(load = false) {
      const date = this.$store.state.list.date
      let brandIds = this.selectBrand
      if (this.selectBrand.some((item) => item === 'all')) {
        brandIds = this.sortList
          .filter((item) => item.brandId !== 'all')
          .map((i) => {
            return i.brandId
          })
      }
      const params = {
        brandIds: brandIds,
        dateStart: this.$day(date[0]).format('YYYY-MM-DD'),
        dateEnd: this.$day(date[1]).format('YYYY-MM-DD'),
        destination: this.city,
        orderType: 0,
        serviceType: ['3'],
        storeName: '',
        pageSize: 15,
        pageNum: this.pageNum,
      }
      getHotelListApp(params)
        .then((res) => {
          const { code, data } = res.data
          if (code === 200 && data.rows.length) {
            if (load) {
              this.hotelList.push(...data.rows)
            } else {
              this.hotelList = data.rows
            }
            this.total = data.totalRows
          } else {
            if (!load) {
              this.hotelList = []
              this.total = 0
            }
          }
        })
        .catch(() => {
          this.hotelList = []
          this.total = 0
        })
    },

    commonClear() {
      this.pageNum = 1
      this.finished = false
    },
  },
}
</script>

<style lang="scss" scoped>
.hotel_list {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f7f7f9;
  .search_title {
    position: relative;
    width: 100%;
    height: 356rpx;
    .title_img {
      width: 100%;
      height: 202rpx;
    }
    .search_list {
      position: absolute;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      background: transparent;
      .search_type {
        width: 686rpx;
        height: 116rpx;
        padding: 0 28rpx;
        background-color: #fff;
        border-radius: 8rpx;
        box-shadow: 0 4rpx 16rpx 0 rgba(0, 0, 0, 0.05);
        @include flex-between;
        .type_item {
          height: 72rpx;
          padding: 0 20rpx;
          font-size: 26rpx;
          font-weight: 400;
          color: #333;
          background-color: #f0f0f0;
          border-radius: 5rpx;
          @include flex-align;
          .text_content {
            display: inline-block;
            width: calc(100% - 16rpx);
            height: 72rpx;
            overflow: hidden;
            line-height: 72rpx;
            text-overflow: ellipsis;
            white-space: nowrap;
            &.placeholder {
              font-size: 26rpx;
              font-weight: 400;
              color: #ccc;
            }
          }
          &.city {
            display: flex;
            justify-content: space-between;
            width: 182rpx;
            .city_icon {
              width: 10rpx;
              height: 18rpx;
            }
          }
          &.date {
            flex: 1;
            justify-content: center;
            padding: 0;
            margin: 0 16rpx;
          }
          &.search {
            width: 182rpx;
            .search_icon {
              width: 26rpx;
              height: 26rpx;
              margin-right: 14rpx;
            }
          }
        }
      }
      .sort_list {
        position: relative;
        width: 100%;
        padding: 0 60rpx;
        .list_title {
          width: 100%;
          height: 96rpx;
          background-color: #f7f7f9;
          @include flex-between;
          .title_item {
            height: 100%;
            @include flex-align;
            .type_text {
              max-width: 200rpx;
              overflow: hidden;
              font-size: 24rpx;
              font-weight: 400;
              color: #333;
              text-overflow: ellipsis;
              white-space: nowrap;
              &.active {
                color: #da1a23;
              }
            }
            .type_icon {
              width: 12rpx;
              height: 8rpx;
              margin-left: 8rpx;
            }
          }
        }
        .type_list {
          position: absolute;
          top: 96rpx;
          left: 0;
          z-index: 2;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          width: 100vw;
          padding-bottom: 16rpx;
          .sort_wrapper {
            width: 100%;
            .item_wrapper {
              display: flex;
              flex-wrap: wrap;
              width: 100%;
              min-height: 126rpx;
              padding: 0 28rpx 50rpx;
              background: #f7f7f9;
              .list_item {
                width: 160rpx;
                height: 60rpx;
                margin: 16rpx 16rpx 0 0;
                overflow: hidden;
                font-size: 22rpx;
                font-weight: 400;
                line-height: 60rpx;
                color: #59585c;
                text-align: center;
                text-overflow: ellipsis;
                white-space: nowrap;
                background: #efeff3;
                border-radius: 8rpx;
                &.choose {
                  color: #da1a23;
                  background-color: #fff5f5;
                  border: 2rpx solid #cf0a2c;
                }
                &:nth-child(4n + 4) {
                  margin-right: 0;
                }
              }
            }
            .sort_btn {
              width: 100%;
              padding: 0 32rpx 48rpx;
              background-color: #f7f7f9;
              @include flex-between;
              .btn {
                width: 330rpx;
                height: 80rpx;
                margin: 0;
                font-size: 26rpx;
                font-weight: 500;
                line-height: 80rpx;
                color: #fff;
                &.reset {
                  background-color: #333;
                }
                &.disable {
                  background-color: #dcdcdc;
                }
                &.sure {
                  background-color: #da1a23;
                }
              }
            }
          }
          .mask {
            flex: 1;
            background-color: rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
  }

  .no_hotel {
    display: flex;
    justify-content: center;
    width: 100vw;
    .no_image {
      width: 332rpx;
      height: 280rpx;
      margin-top: 160rpx;
    }
  }

  .store_list {
    box-sizing: border-box;
    width: 100vw;
    .finished_text {
      padding-bottom: 94rpx;
      font-size: 20rpx;
      font-weight: 400;
      color: #c1c1c1;
      text-align: center;
    }
  }
}
</style>
