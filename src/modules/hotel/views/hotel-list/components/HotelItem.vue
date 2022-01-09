<template>
  <view
    v-if="Object.keys(hotelItem).length"
    class="hotel_item"
    @click="toHotelDetail()"
  >
    <!-- <view class="score">{{ hotelItem.score + '分' }}</view> -->
    <image class="hotel_icon" src="~@/static/common/hotel-icon.png" mode="" />
    <tiny-image
      v-if="hotelItem.img"
      class="hotel_bg"
      :src="hotelItem.img"
      :width="686"
      :height="284"
      :radius="'12rpx 12rpx 0 0'"
      :lazyLoad="true"
    />
    <view v-else class="hotel_bg"></view>
    <view class="hotel_info">
      <view class="info_left">
        <view class="hotel_name">{{ hotelItem.name }}</view>
        <view class="hotel_address">
          <image
            class="address_icon"
            src="~@/static/common/address.png"
            mode=""
          />
          <text class="address_text">{{ hotelItem.address || '暂无' }}</text>
        </view>
      </view>
      <view class="info_right">
        <view v-if="hotelItem.price" class="hotel_price">
          <text>¥</text>
          <text class="true_price">{{ pointsToYuan(hotelItem.price) }}</text>
          <text>起</text>
        </view>
        <view v-else class="no_price">敬请期待</view>
        <button
          class="btn"
          :class="{ order: hotelItem.price && hotelItem.amount }"
        >
          {{ btnText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import TinyImage from '@/components/TinyImage/TinyImage.vue'
import { pointsToYuan } from '@/utils/util'
export default {
  name: 'HotelItem',
  components: { TinyImage },
  props: {
    hotelItem: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  computed: {
    btnText() {
      if (this.hotelItem.type.storeType * 1 === 1) return '预订'
      return this.hotelItem.type.storeTypeName
    },
  },
  methods: {
    pointsToYuan,
    toHotelDetail() {
      if (this.hotelItem.type.storeType !== '1') {
        return uni.showToast({
          title: '敬请期待',
          icon: 'none',
          duration: 2000,
        })
      }
      this.$to(
        `/modules/hotel/views/hotelInfo/HotelInfo?id=${this.hotelItem.id}`
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.hotel_item {
  position: relative;
  width: calc(100% - 64rpx);
  margin: 0 auto 24rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx 0 rgba(0, 0, 0, 0.05);
  .score {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    width: 72rpx;
    height: 36rpx;
    font-size: 22rpx;
    font-weight: 400;
    line-height: 36rpx;
    color: #fff;
    text-align: center;
    background-color: rgba($color: #000, $alpha: 0.7);
    border-radius: 4rpx;
  }
  .hotel_icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 94rpx;
    height: 36rpx;
  }
  .hotel_bg {
    width: 100%;
    height: 284rpx;
    border-top-left-radius: 12rpx;
    border-top-right-radius: 12rpx;
  }
  .hotel_info {
    display: flex;
    justify-content: space-between;
    min-height: 164rpx;
    padding: 32rpx 20rpx;
    .info_left {
      .hotel_name {
        width: 500rpx;
        height: 28rpx;
        margin-bottom: 20rpx;
        overflow: hidden;
        font-size: 28rpx;
        font-weight: 500;
        line-height: 28rpx;
        color: #333;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .hotel_address {
        height: 22rpx;
        font-size: 22rpx;
        font-weight: 400;
        color: #b2b2b6;
        @include flex-align;
        .address_icon {
          width: 20rpx;
          height: 24rpx;
          margin-right: 8rpx;
        }
        .address_text {
          width: 420rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .info_right {
      text-align: right;
      .hotel_price {
        font-size: 18rpx;
        font-weight: 400;
        color: #da1a23;
        .true_price {
          font-size: 36rpx;
          font-weight: 500;
        }
      }
      .no_price {
        font-size: 22rpx;
        font-weight: 400;
        color: #ccc;
      }
      .btn {
        min-width: 106rpx;
        height: 52rpx;
        padding: 0 16rpx;
        margin-top: 22rpx;
        font-size: 24rpx;
        font-weight: 400;
        line-height: 52rpx;
        color: #fff;
        background: #ccc;
        border-radius: 4rpx;
        &.order {
          background: #da1a23;
        }
        &::after {
          border: none;
        }
      }
    }
  }
}
</style>
