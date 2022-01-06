<template>
  <view
    v-if="Object.keys(item).length"
    class="trip_item"
    :class="{ complete: [2, 3].includes(item.status) }"
  >
    <view class="item_info" @click="toOrderDetail(item.status, item.id)">
      <tiny-image
        class="item_bgImg"
        :src="item.coverImgUrl"
        :width="132"
        :height="176"
        :radius="6"
        :scaleX="132"
      />
      <view class="item_base_info">
        <view class="item_name">{{ item.hotelNameCn }}</view>
        <view class="item_hotel_info">
          <view class="item_date">{{ item | detailTripDate }}</view>
          <view class="item_address">
            <image
              class="address_icon"
              src="~@/static/common/address.png"
              mode=""
            />
            <text class="address_text">{{ item.addressCn || '' }}</text>
          </view>
        </view>
      </view>
      <view class="item_state">
        <text class="state_text" :style="{ color: colors[item.status] }">{{
          fontText[item.status]
        }}</text>
        <view class="to_detail">
          <text>详情</text>
          <image
            class="right_icon"
            src="~@/static/common/right-grey.svg"
            mode=""
          />
        </view>
      </view>
    </view>
    <view
      v-if="item.status === 2 && [1, 2].includes(item.contentStatus)"
      class="btn_list"
    >
      <button
        class="btn_item"
        :class="{ first: item.contentStatus === 1 }"
        @click.stop="toRate(item.id, item.contentStatus)"
      >
        {{ item.contentStatus === 1 ? '去评价' : '追加评价' }}
      </button>
      <!-- <button v-else class="btn_item" @click.stop="cancelOrder(item.id)">
        取消订单
      </button> -->
    </view>
  </view>
</template>

<script>
import TinyImage from '@/components/TinyImage/TinyImage.vue'
export default {
  name: 'TripListItem',
  components: { TinyImage },
  filters: {
    detailTripDate(val) {
      const startDate = val.startTime.slice(5, 10).replace('-', '月') + '日'
      const endDate = val.endTime.slice(5, 10).replace('-', '月') + '日'
      return startDate + '-' + endDate
    },
  },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      colors: {
        0: '#DA1A23',
        1: '#f5a623',
        2: '#868689',
        3: '#868689',
        4: '#868689',
        5: '#868689',
      },
      fontText: {
        0: '待付款',
        1: '已预订',
        2: '已完成',
        3: '已取消',
        4: '已入住',
        5: '未使用',
      },
    }
  },
  methods: {
    toOrderDetail(status, id) {
      this.$to(
        `/modules/hotel/views/order-detail/OrderDetail?type=hotel&status=${status}&id=${id}`
      )
    },
    cancelOrder(id) {
      this.$emit('cancelOrder', id)
    },
    toRate(id, contentStatus) {
      this.$to(
        `/modules/rate/views/hotelComment/index?orderId=${id}&contentStatus=${contentStatus}`
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.trip_item {
  box-sizing: border-box;
  width: 686rpx;
  padding: 32rpx;
  margin: 0 auto 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 0 8rpx rgba(0, 0, 0, 0.05);
  .item_info {
    @include flex-between;
    .item_bgImg {
      width: 132rpx;
      height: 176rpx;
      border-radius: 6rpx;
    }
    .item_base_info {
      height: 176rpx;
      padding: 8rpx 0;
      margin: 0 24rpx;
      .item_name {
        width: 360rpx;
        height: 28rpx;
        margin-bottom: 16rpx;
        overflow: hidden;
        font-size: 30rpx;
        font-weight: 500;
        line-height: 30rpx;
        color: #101010;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .item_hotel_info {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin-top: 44rpx;
        font-weight: 400;
        .item_date {
          font-size: 24rpx;
          font-weight: 400;
          color: #868689;
        }
        .item_address {
          height: 40rpx;
          padding: 6rpx 10rpx;
          margin-top: 8rpx;
          font-size: 24rpx;
          color: #868689;
          background-color: #efeff3;
          border-radius: 6rpx;
          box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.04);
          @include flex-align;
          .address_icon {
            width: 20rpx;
            height: 24rpx;
            margin-right: 8rpx;
          }
          .address_text {
            width: 320rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
    .item_state {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 176rpx;
      padding: 12rpx 0 20rpx;
      .state_text {
        font-size: 24rpx;
        font-weight: 500;
        line-height: 24rpx;
      }
      .to_detail {
        @include flex-align;

        font-size: 24rpx;
        font-weight: 400;
        color: #868689;
        .right_icon {
          width: 8rpx;
          height: 16rpx;
          margin-left: 8rpx;
        }
      }
    }
  }
  .btn_list {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 30rpx;
    .btn_item {
      box-sizing: border-box;
      min-width: 132rpx;
      height: 48rpx;
      padding: 0 18rpx;
      margin: 0;
      font-size: 24rpx;
      font-weight: 400;
      color: #101010;
      background-color: #fff;
      border: 1px solid #101010;
      border-radius: 6rpx;
      @include flex-center;
      &.first {
        color: #fff;
        background-color: #da1a23;
        border: none;
      }
    }
  }
}
</style>
