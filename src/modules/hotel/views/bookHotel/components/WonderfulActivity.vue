<template>
  <view class="wonderful_activity">
    <view v-for="item in list" :key="item.id" class="activity_item">
      <tiny-image
        :width="0"
        :height="0"
        class="activity_pic"
        :src="item.picUrl"
        :scaleX="750"
        :radius="'12rpx 12rpx 0 0'"
        @clickCallback="toPageLink(item.isJumpLink, item.link)"
      />
      <view class="activity_content">{{ item.content }}</view>
      <view class="to_link" @click="toPageLink(item.isJumpLink, item.link)">
        <text>查看详情</text>
        <image
          class="link_icon"
          src="~@/static/common/right-grey.svg"
          mode=""
        />
      </view>
    </view>
  </view>
</template>

<script>
import TinyImage from '@/components/TinyImage/TinyImage.vue'
export default {
  name: 'WonderfulActivity',
  components: { TinyImage },
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {}
  },
  methods: {
    toPageLink(canLink, link) {
      if (!canLink) return
      const token = uni.getStorageSync('token')
      if (!token) {
        this.$emit('needAuthToH5', {
          link,
          isBanner: false,
        })
        return
      }
      console.log(link)
      this.$to(
        `/modules/hotel/views/h5-link/H5Link?src=${link.split('?')[0]}&${
          link.split('?')[1]
        }&token=${encodeURIComponent(token)}`
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.wonderful_activity {
  width: 100%;
  padding: 32rpx 0;
  .activity_item {
    width: 686rpx;
    margin: 0 auto 32rpx;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 16rpx 0 rgba(24, 25, 35, 0.05);
    &:last-child {
      margin-bottom: 0;
    }
    .activity_pic {
      width: 100%;
      height: 256rpx;
      border-top-left-radius: 12rpx;
      border-top-right-radius: 12rpx;
    }
    .activity_content {
      width: 100%;
      padding: 24rpx;
      font-size: 28rpx;
      font-weight: 400;
      color: #333;
      text-align: justify;
    }
    .to_link {
      position: relative;
      width: 100%;
      height: 76rpx;
      padding: 0 32rpx;
      font-size: 24rpx;
      font-weight: 400;
      color: #868689;
      @include flex-between;
      .link_icon {
        width: 10rpx;
        height: 18rpx;
      }
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        content: '';
        background: #e1e1e5;
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        -webkit-transform-origin: 0 0;
        transform-origin: 0 0;
      }
    }
  }
}
</style>
