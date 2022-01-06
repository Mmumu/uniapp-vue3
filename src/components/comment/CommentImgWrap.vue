<template>
  <view class="img-wrapper">
    <view
      v-for="(item, index) in isBriefPhoto
        ? comment.media.slice(0, 3)
        : comment.media"
      :key="index"
      class="photo-wrapper"
      @click.stop="previewImg(index)"
    >
      <tiny-image
        v-if="item.type === 2"
        class="photo"
        :src="item.url"
        :scaleX="220"
      />
      <tiny-image
        v-if="item.type === 1"
        class="photo"
        :src="item.coverUrl"
        :scaleX="220"
      />
      <image
        v-if="item.type === 1"
        class="video-play"
        src="~@/static/common/video-play.png"
        mode=""
      />
      <view v-if="isBriefPhoto && index === 2" class="tag">
        <image class="tag-photo" src="~@/static/common/tag-photo.png" mode="" />
        <view class="number">{{ comment.media.length }}</view>
      </view>
    </view>
  </view>
</template>
<script>
import { tinyUrl } from '@/tiny/tiny'
import TinyImage from '../TinyImage/TinyImage.vue'
export default {
  components: { TinyImage },
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
    isBriefPhoto: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    /**
     * @method
     * @desc 预览评论的图片和视频
     * @param {String} index 预览的开始位置
     */
    previewImg(index) {
      const sourcesList = []
      this.comment.media.forEach((item, index) => {
        sourcesList.push({
          url: item.type === 1 ? item.url : tinyUrl(item.url, { width: 750 }),
          type: item.type === 1 ? 'video' : 'image',
          poster: item.coverUrl,
        })
      })
      wx.previewMedia({
        sources: sourcesList,
        current: index,
        fail: () => {
          uni.showToast({
            title: '预览图片失败,请重新预览',
            icon: 'none',
          })
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.img-wrapper {
  flex-wrap: wrap;
  margin-top: 10rpx;
  @include flex-align;
  .photo-wrapper {
    position: relative;
    margin-right: 10rpx;
    margin-bottom: 14rpx;
    line-height: 0;
    .photo {
      width: 220rpx;
      height: 220rpx;
      border-radius: 12rpx;
    }
    &:nth-child(3n) {
      margin-right: 0;
    }
    .tag {
      position: absolute;
      right: 8rpx;
      bottom: 8rpx;
      width: 52rpx;
      height: 32rpx;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 8rpx;
      @include flex-align;
      .tag-photo {
        width: 16rpx;
        height: 16rpx;
        margin-left: 4px;
      }

      .number {
        margin-left: 4px;
        font-size: 20rpx;
        color: #fff;
      }
    }
    .video-play {
      position: absolute;
      top: 80rpx;
      left: 80rpx;
      width: 60rpx;
      height: 60rpx;
    }
  }
}
</style>
