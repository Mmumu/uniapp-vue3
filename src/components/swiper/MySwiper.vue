<template>
  <view
    class="my_swiper"
    :style="{
      boxSizing: 'border-box',
      margin: '0 auto',
      width: swiperWidth,
      height: swiperHeight,
    }"
  >
    <swiper
      :indicator-dots="false"
      indicator-color="#999"
      indicator-active-color="#fff"
      :autoplay="isAuto"
      :current="current"
      :interval="interval"
      :circular="circular"
      class="swiper_wrap"
      @change="swiperChange"
    >
      <swiper-item
        v-for="(item, index) in images"
        :key="index"
        class="swiper_item"
        @click="clickSwiperItem(index)"
      >
        <tiny-image
          :width="0"
          :height="0"
          :radius="radius"
          class="item_img"
          :src="item"
          :scaleX="750"
          lazy-load
          mode="aspectFill"
        />
      </swiper-item>
    </swiper>
    <view
      v-if="showDots"
      class="swiper_dots"
      :class="{ left: showLeft }"
      :style="{ paddingLeft: leftLength, bottom: bottomLength }"
    >
      <block v-for="(dot, indey) in images" :key="indey">
        <view
          class="swiper_dot"
          :style="defaultDot === indey ? activeDotSize : dotSize"
        ></view>
      </block>
    </view>

    <view v-if="showLength && images.length" class="swiper_length">
      <image class="tag-photo" src="~@/static/common/tag-photo.png" mode="" />
      {{ images.length }}
    </view>
  </view>
</template>

<script>
import TinyImage from '../TinyImage/TinyImage.vue'
export default {
  name: 'MySwiper',
  components: { TinyImage },
  props: {
    images: {
      type: Array,
      default() {
        return []
      },
    },
    swiperHeight: {
      type: String,
      default: '914rpx',
    },
    swiperWidth: {
      type: String,
      default: '100vw',
    },
    // 当前滑块的位置
    current: {
      type: Number,
      default: 0,
    },
    // 是否需要一直轮播
    circular: {
      type: Boolean,
      default: true,
    },
    // 多久轮播一次
    interval: {
      type: Number,
      default: 3000,
    },
    // 是否圆角
    radius: {
      type: String,
      default: '0',
    },
    // 是否自动轮播
    isAuto: {
      type: Boolean,
      default: true,
    },
    // 是否展示指示器
    showDots: {
      type: Boolean,
      default: true,
    },
    // 是否展示图片个数
    showLength: {
      type: Boolean,
      default: false,
    },
    // 指示器是否展示在左边
    showLeft: {
      type: Boolean,
      default: false,
    },
    // 如果展示在左边,距离左边多远
    leftLength: {
      type: String,
      default: '24rpx',
    },
    // 指示器距离下面多远
    bottomLength: {
      type: String,
      default: '40rpx',
    },
    // 指示器样式
    dotSize: {
      type: String,
      default:
        'width: 20rpx; height: 20rpx;margin-right: 14rpx;background-color: #999;border-radius: 100%;',
    },
    // 活跃状态下指示器大小
    activeDotSize: {
      type: String,
      default:
        'width: 40rpx;height: 20rpx;margin-right: 14rpx;background-color: #fff;border-radius: 72rpx;',
    },
  },
  data() {
    return {
      defaultDot: 0,
    }
  },
  methods: {
    // 点击swiper
    clickSwiperItem(index) {
      this.$emit('clickSwiperItem', index)
    },
    swiperChange(e) {
      this.defaultDot = e.detail.current
      this.$emit('swiperChange', e.detail.current)
    },
  },
}
</script>

<style lang="scss" scoped>
.my_swiper {
  position: relative;
  .swiper_length {
    position: absolute;
    right: 24rpx;
    bottom: 32rpx;
    width: 52rpx;
    height: 32rpx;
    font-size: 20rpx;
    font-weight: 400;
    line-height: 40rpx;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8rpx;
    @include flex-center;
    .tag-photo {
      width: 16rpx;
      height: 16rpx;
      margin-right: 6rpx;
    }
  }
  .swiper_wrap {
    width: 100%;
    height: 100%;
    .swiper_item {
      .item_img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .swiper_dots {
    position: absolute;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    @include flex-center;
    &.left {
      justify-content: flex-start;
    }
    .swiper_dot {
      width: 20rpx;
      height: 20rpx;
      margin-right: 14rpx;
      background-color: #999;
      border-radius: 100%;
      &.active {
        width: 40rpx;
        background-color: #fff;
        border-radius: 72rpx;
      }
      &.left_icon {
        width: 12rpx;
        height: 12rpx;
        &.active {
          width: 24rpx;
          background-color: #fff;
          border-radius: 72rpx;
        }
      }
    }
    .swiper_dot:last-child {
      margin: 0;
    }
  }
}
</style>
