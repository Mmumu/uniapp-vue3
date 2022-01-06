<template>
  <view class="hotel_dialog">
    <van-popup
      overlay-style="background: rgba(0,0,0,0.7)"
      :show="show"
      :custom-style="show ? style : 'display: none'"
      z-index="9999"
      @close.stop.prevent="onClose"
    >
      <view
        v-if="needAuthorize || needTitle"
        class="dialog_title"
        :class="{ toast_title: needTitle }"
      >
        <text>{{ title }}</text>
      </view>
      <view
        class="dialog_info"
        :class="{
          default: !needAuthorize && !needTitle,
          toast_info: !needAuthorize && needTitle,
        }"
      >
        <text>{{ bodyInfo }}</text>
        <view v-if="needAuthorize" class="body_choose" @click="toCheckAuth">
          <!-- 某个版本微信开发工具使用v-show无效, 暂用class控制 -->
          <view class="check_box" :class="{ self_hidden: checked }"></view>
          <image
            class="check_true"
            :class="{ self_hidden: !checked }"
            src="~@/static/user/check-auth.png"
            mode=""
          />
          <view>
            我已阅读并同意
            <text class="high_light" @click.stop="lookPrivacy">{{
              '隐私政策'
            }}</text
            >和
            <text class="high_light" @click.stop="lookClause">{{
              '服务条款'
            }}</text>
          </view>
        </view>
      </view>
      <view class="btn_list">
        <button class="btn close" @click.stop.prevent="cancel">
          {{ closeBtnText }}
        </button>
        <button class="btn confirm" @click.stop.prevent="confirm">
          {{ confirmBtnText }}
        </button>
      </view>
    </van-popup>
  </view>
</template>

<script>
export default {
  name: 'OrderDialog',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    canClick: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '这是酒店弹窗头',
    },
    needTitle: {
      type: Boolean,
      default: false,
    },
    bodyInfo: {
      type: String,
      default: '这是弹窗的介绍文字',
    },
    needAuthorize: {
      type: Boolean,
      default: true,
    },
    closeBtnText: {
      type: String,
      default: '取消',
    },
    confirmBtnText: {
      type: String,
      default: '确定',
    },
  },
  data() {
    return {
      checked: false,
    }
  },
  computed: {
    style() {
      if (this.needAuthorize) {
        return 'height: 418rpx; width: 630rpx;border-radius: 16rpx; display: flex; flex-direction: column; align-items: center;'
      } else {
        return 'height: 372rpx; width: 630rpx;border-radius: 16rpx; display: flex; flex-direction: column; align-items: center;'
      }
    },
  },
  methods: {
    onClose() {
      this.$emit('close')
      this.$emit('update:show', false)
    },
    // 选择授权
    toCheckAuth() {
      this.checked = !this.checked
    },
    lookPrivacy() {
      const link = 'https://h5.betterwood.com/#/privacy'
      this.$to(`/modules/hotel/views/h5-link/H5Link?src=${link}`)
    },
    lookClause() {
      const link = 'https://h5.betterwood.com/#/service'
      this.$to(`/modules/hotel/views/h5-link/H5Link?src=${link}`)
    },
    confirm() {
      if (!this.canClick) return
      if (!this.checked && this.needAuthorize) {
        return uni.showToast({
          title: '请同意隐私政策及服务条款',
          icon: 'none',
          duration: 2000,
        })
      }
      this.$emit('confirm', this.checked)
    },
    cancel() {
      this.onClose()
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="scss" scoped>
.hotel_dialog {
  color: #333;
  .dialog_title {
    width: 100%;
    height: 40rpx;
    margin: 48rpx 0 28rpx;
    font-size: 36rpx;
    font-weight: 600;
    line-height: 40rpx;
    text-align: center;
    &.toast_title {
      height: 40rpx;
      margin: 80rpx 0 32rpx;
      font-size: 40rpx;
      font-weight: 600;
      line-height: 40rpx;
      color: #930202;
    }
  }
  .dialog_info {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 40rpx;
    margin-bottom: 12rpx;
    font-size: 28rpx;
    color: #666;
    &.default {
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
    &.toast_info {
      align-items: center;
      justify-content: flex-start;
      height: 36rpx;
      font-size: 36rpx;
      font-weight: 600;
      line-height: 36rpx;
      color: #333;
    }
    .body_choose {
      box-sizing: border-box;
      font-size: 28rpx;
      @include flex-center;
      .check_box {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
        border: 1px solid #ddd;
        border-radius: 100%;
      }
      .check_true {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
      }
      .self_hidden {
        display: none;
      }
      .high_light {
        color: #017aff;
      }
    }
  }
  .btn_list {
    box-sizing: border-box;
    width: 100%;
    padding: 0 40rpx;
    margin-bottom: 40rpx;
    @include flex-between;
    .btn {
      width: 258rpx;
      height: 68rpx;
      padding: 0;
      margin: 0;
      font-size: 28rpx;
      line-height: 68rpx;
      color: #666;
      background-color: #fff;
      border: 1px solid #979797;
      border-radius: 40rpx;
      &::after {
        border: none;
      }
      &.confirm {
        color: #fff;
        background-color: #da1a23;
        border: none;
      }
    }
  }
}
</style>
