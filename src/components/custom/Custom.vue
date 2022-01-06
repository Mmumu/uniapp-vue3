<template>
  <view class="custom_bar">
    <view
      v-if="needSeat"
      :style="{
        height: heightSize ? heightSize : customBar + 'px',
      }"
    ></view>
    <view
      class="custom"
      :class="{ is_fixed: globalFixed, round: round }"
      :style="{
        height: heightSize ? heightSize : customBar + 'px',
        paddingTop: statusBar + 'px',
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        color: fontColor,
      }"
    >
      <view
        v-if="isBack"
        class="back_title"
        :style="{
          height: customBar - statusBar + 'px',
          position: 'fixed',
          top: statusBar + 'px',
          left: '20rpx',
          paddingRight: '220rpx',
          boxSizing: 'border-box',
        }"
      >
        <text
          v-if="needBackIcon"
          :style="{
            fontWeight: 600,
            zIndex: 9,
            display: 'inline-block',
            width: '100rpx',
            height: customBar - statusBar + 'px',
            lineHeight: customBar - statusBar + 'px',
          }"
          class="iconfont iconxiangzuo"
          @click="goBack"
        ></text>
        <slot name="back"></slot>
      </view>
      <view
        class="content"
        :style="{
          height: customBar + 'px',
          paddingTop: statusBar + 'px',
        }"
      >
        <slot name="content"></slot>
      </view>
      <view class="custom_body">
        <slot name="body"></slot>
      </view>
    </view>
  </view>
</template>

<script>
const app = getApp()
export default {
  name: 'Custom',
  props: {
    isBack: {
      type: Boolean,
      default: true,
    },
    // 是否需要返回按钮
    needBackIcon: {
      type: Boolean,
      default: true,
    },
    globalFixed: {
      type: Boolean,
      default: true,
    },
    // 是否需要下面为圆角
    round: {
      type: Boolean,
      default: false,
    },
    bgColor: {
      type: String,
      default: '#fff',
    },
    bgImage: {
      type: String,
      default: '',
    },
    fontColor: {
      type: String,
      default: '#000',
    },
    heightSize: {
      type: String,
      default: '',
    },
    showBody: {
      type: Boolean,
      default: false,
    },
    // 是否需要占位
    needSeat: {
      type: Boolean,
      default: true,
    },
    // 点击返回按钮是否是返回上一页
    backLastPage: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      customBar: app.globalData.customBar,
      statusBar: app.globalData.statusBar,
    }
  },

  mounted() {
    console.log(app, "app@@@")
    // 因为globalData中的内容是异步任务获取, 加载首页时可能还未加载出来,所以在mounted中重新获取, 以防首页加载失败
    this.customBar = app.globalData.customBar
    this.statusBar = app.globalData.statusBar
  },

  methods: {
    goBack() {
      if (this.backLastPage) {
        uni.navigateBack({
          delta: 1,
        })
      } else {
        this.$emit('back')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.custom_bar {
  width: 100vw;
  .custom {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100vw;
    background-size: cover;
    &.round {
      border-bottom-right-radius: 16rpx;
      border-bottom-left-radius: 16rpx;
    }
    &.is_fixed {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 99;
    }
    .back_title {
      z-index: 100;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .content {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      font-weight: 600;
    }
    .custom_body {
      flex: 1;
      width: 100%;
    }
  }
}
</style>
