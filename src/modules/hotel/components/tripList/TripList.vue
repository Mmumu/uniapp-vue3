<template>
  <view class="trip_list" :style="{ height: `calc(100vh - ${customBar}px)` }">
    <scroll-view
      v-if="tripList.length"
      scroll-y
      class="have_list"
      lower-threshold="80"
      @scrolltolower="needUpdateList"
    >
      <block v-for="item in tripList" :key="item.id">
        <TripListItem
          v-if="currentIndex === 0"
          :item="item"
          @cancelOrder="cancelOrder"
        />
        <coupon-item
          v-else
          from="mine"
          padding="46rpx 32rpx 22rpx"
          :coupon-item="item"
          :can-use="item.couponStatus === 1"
          @openItem="openItem"
        >
          <template #btn>
            <button
              v-if="item.couponStatus === 1"
              class="to_use"
              @click="toUse"
            >
              去使用
            </button>
          </template>
        </coupon-item>
      </block>
      <view v-if="stopLoading" class="bottom_line">—— 已经到底部了 ——</view>
    </scroll-view>
    <view v-else class="no_trip">
      <image class="no_img" src="~@/static/common/no-trip.svg" mode="" />
      <text>{{ currentIndex ? '暂无优惠券' : '暂无行程' }}</text>
    </view>
  </view>
</template>

<script>
import TripListItem from './TripListItem'
import CouponItem from '@/modules/hotel/views/hotel-coupons/components/CouponItem.vue'
export default {
  name: 'TripList',
  components: {
    TripListItem,
    CouponItem,
  },
  props: {
    currentIndex: {
      type: Number,
      default: 0,
    },
    customBar: {
      type: Number,
      default: 44,
    },
    tripList: {
      type: Array,
      default() {
        return []
      },
    },
    stopLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showEnd: false,
    }
  },
  watch: {
    stopLoading(val) {
      this.showEnd = val
    },
  },
  onLoad() {
    console.log(this.currentIndex)
  },
  methods: {
    needUpdateList() {
      this.$emit('needUpdateList')
    },
    cancelOrder(id) {
      this.$emit('cancelOrder', id)
    },
    toUse() {
      uni.switchTab({
        url: '/modules/hotel/views/bookHotel/BookHotel',
      })
    },
    openItem(val) {
      this.$emit('openItem', val)
    },
  },
}
</script>

<style lang="scss" scoped>
.trip_list {
  box-sizing: border-box;
  width: 100%;
  padding: 30rpx 30rpx;
  background-color: #f7f7f7;
  .have_list {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    .bottom_line {
      padding-bottom: 30rpx;
      font-size: 28rpx;
      color: #c1c1c1;
      text-align: center;
    }
    .to_use {
      width: 116rpx;
      height: 48rpx;
      padding: 0;
      margin: 0;
      font-size: 24rpx;
      font-weight: 500;
      color: #fff;
      background: #da1a23;
      border-radius: 6rpx;
      @include flex-center;
    }
  }
  .no_trip {
    width: 100%;
    height: 100%;
    font-size: 28rpx;
    font-weight: 400;
    color: #666;
    @include flex-ycenter;
    .no_img {
      width: 414rpx;
      height: 280rpx;
      margin-bottom: 32rpx;
    }
  }
}
</style>
