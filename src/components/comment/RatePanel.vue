<template>
  <view class="panel-wrapper">
    <view class="left-score">
      <view class="score-wrapper">
        <text class="score">{{
          Number(hotelScore.generalScore || 0).toFixed(1)
        }}</text>
        <text>分</text>
      </view>
      <view class="grade-wrapper">
        <view class="status">{{ allScore }}</view>
        <BDWRate :rateScore="hotelScore.generalScore" />
      </view>
    </view>
    <view class="line"></view>
    <view class="right-rate">
      <view class="circle-wrapper">
        <van-circle
          type="2d"
          :value="hotelScore.locationScore * 20"
          layer-color="rgba(218, 26, 35, .1)"
          color="#DA1A23"
          size="34"
          :speed="0"
          stroke-width="3"
          class="circle"
        >
          <view>{{
            Number(hotelScore.locationScore || 0).toFixed(1) || '0'
          }}</view>
        </van-circle>
        <view class="bottom-text">位置</view>
      </view>
      <view class="circle-wrapper">
        <van-circle
          type="2d"
          :value="hotelScore.facilityScore * 20"
          layer-color="rgba(218, 26, 35, .1)"
          color="#DA1A23"
          size="34"
          stroke-width="3"
          :speed="0"
          class="circle"
        >
          <view>{{
            Number(hotelScore.facilityScore || 0).toFixed(1) || '0'
          }}</view>
        </van-circle>
        <view class="bottom-text">设施</view>
      </view>
      <view class="circle-wrapper">
        <van-circle
          type="2d"
          :value="hotelScore.serviceScore * 20"
          layer-color="rgba(218, 26, 35, .1)"
          color="#DA1A23"
          size="34"
          stroke-width="3"
          :speed="0"
          class="circle"
        >
          <view>{{
            Number(hotelScore.serviceScore || 0).toFixed(1) || '0'
          }}</view>
        </van-circle>
        <view class="bottom-text">服务</view>
      </view>
      <view class="circle-wrapper">
        <van-circle
          type="2d"
          :value="hotelScore.sanitaryScore * 20"
          layer-color="rgba(218, 26, 35, .1)"
          color="#DA1A23"
          size="34"
          stroke-width="3"
          :speed="0"
          class="circle"
        >
          <view>{{
            Number(hotelScore.sanitaryScore || 0).toFixed(1) || '0'
          }}</view>
        </van-circle>
        <view class="bottom-text">卫生</view>
      </view>
    </view>
  </view>
</template>

<script>
import BDWRate from '@/components/onlyReadyRate/index.vue'
export default {
  components: { BDWRate },
  options: {
    styleIsolation: 'shared',
  },
  props: {
    hotelScore: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {}
  },
  computed: {
    allScore() {
      let text = ''
      if (this.hotelScore.generalScore === 5.0) {
        text = '非常好'
      } else if (this.hotelScore.generalScore === 4.9) {
        text = '超棒'
      } else if (this.hotelScore.generalScore === 4.8) {
        text = '棒'
      } else if (this.hotelScore.generalScore === 4.7) {
        text = '很好'
      } else if (this.hotelScore.generalScore === 4.6) {
        text = '好'
      } else if (
        4.0 <= this.hotelScore.generalScore &&
        this.hotelScore.generalScore <= 4.5
      ) {
        text = '不错'
      } else if (
        3.0 <= this.hotelScore.generalScore &&
        this.hotelScore.generalScore <= 3.9
      ) {
        text = '一般'
      } else if (
        2.0 <= this.hotelScore.generalScore &&
        this.hotelScore.generalScore <= 2.9
      ) {
        text = '差'
      } else if (
        1.0 <= this.hotelScore.generalScore &&
        this.hotelScore.generalScore <= 1.9
      ) {
        text = '非常差'
      }
      return text
    },
  },
}
</script>

<style lang="scss" scoped>
.panel-wrapper {
  padding-bottom: 32rpx;
  font-family: 'DIN-Alternate-Bold';
  @include flex-align;
  .left-score {
    height: 100%;

    .score-wrapper {
      height: 60rpx;
      font-size: 24rpx;
      font-weight: 500;
      line-height: 60rpx;
      color: #da1a23;
      .score {
        margin-right: 2px;
        font-size: 60rpx;
      }
    }
    .grade-wrapper {
      margin-top: 12rpx;
      font-size: 24rpx;
      color: #333;
      @include flex-align;

      .status {
        margin-right: 4px;
      }
    }
  }
  .line {
    height: 96rpx;
    margin-left: 50rpx;
    @include scale1px(#d6d6d6, right);
  }
  .right-rate {
    flex: 1;
    justify-content: flex-end;
    height: 100%;
    @include flex-align;
    .circle-wrapper {
      margin-right: 48rpx;
      text-align: center;
      &:last-child {
        margin-right: 0;
      }
      .circle {
        z-index: 1;
        ::v-deep .van-circle__text {
          font-size: 24rpx;
          color: #da1a23;
        }
      }
      .bottom-text {
        font-size: 24rpx;
        font-weight: 400;
      }
    }
  }
}
</style>
