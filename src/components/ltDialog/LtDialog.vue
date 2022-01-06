<template>
  <view class="lt-dialog">
    <van-popup
      :show="showType"
      :close-on-click-overlay="false"
      :custom-style="style"
      overlay-style="background: rgba(0,0,0,0.7)"
      @close="close"
    >
      <view class="dialog_title">{{ titleText }}</view>
      <view class="dialog_body" :class="{ order_type: type === 'order' }">
        <text class="body_item top">{{ bodyText }}</text>
        <text v-if="otherText" class="body_item bottom">{{ otherText }}</text>
      </view>
      <view class="btn_list" :class="{ center: !needCloseBtn || !needSureBtn }">
        <button v-if="needCloseBtn" class="btn close" @click="close">
          {{ cancelBtnText }}
        </button>
        <button
          v-if="type === 'phone' && needSureBtn"
          class="btn confirm"
          open-type="getPhoneNumber"
          @getphonenumber="getPhoneNumber"
        >
          {{ confirmBtnText }}
        </button>
        <button
          v-if="type !== 'phone' && needSureBtn"
          class="btn confirm"
          @click="confirm"
        >
          {{ confirmBtnText }}
        </button>
      </view>
    </van-popup>
  </view>
</template>

<script>
import { VIP_URL } from '@/config'

export default {
  name: 'LtDialog',
  props: {
    showType: {
      type: Boolean,
      default: false,
    },
    dialogHeight: {
      type: String,
      default: '372rpx',
    },
    type: {
      type: String,
      default: '',
    },
    titleText: {
      type: String,
      default: '这是一个公用弹窗',
    },
    bodyText: {
      type: String,
      default: '这里是弹窗展示提示信息',
    },
    otherText: {
      type: String,
      default: '',
    },
    needSureBtn: {
      type: Boolean,
      default: true,
    },
    needCloseBtn: {
      type: Boolean,
      default: true,
    },
    cancelBtnText: {
      type: String,
      default: '取消',
    },
    confirmBtnText: {
      type: String,
      default: '确定',
    },
    rawData: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  computed: {
    style() {
      if (this.type === 'order') {
        return `background: #fff; height: ${
          this.dialogHeight
        }; width: 630rpx; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: ${
          !this.needSureBtn || !this.needCloseBtn
            ? '64rpx 0 40rpx'
            : '80rpx 0 40rpx'
        };`
      } else {
        return `background: #fff; height: ${
          this.dialogHeight
        }; width: 630rpx; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: ${
          !this.needSureBtn && !this.needCloseBtn
            ? '80rpx 0 80rpx'
            : '80rpx 0 40rpx'
        };`
      }
    },
  },
  methods: {
    close() {
      this.$emit('update:showType', false)
    },
    confirm() {
      this.$emit('confirm')
    },
    getPhoneNumber(e) {
      const appId = uni.getStorageSync('appId')
      wx.request({
        url: `${VIP_URL}/weixin/wx/user/${appId}/phone`,
        data: {
          rawData: this.rawData,
          signature: this.signature,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: uni.getStorageSync('sessionKey'),
        },
        success: (res) => {
          this.$emit('getPhoneSuccess', res.data.phoneNumber)
        },
        fail: (err) => {
          this.$emit('cancelPhone')
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.lt-dialog {
  .dialog_title {
    height: 40rpx;
    margin-bottom: 28rpx;
    font-size: 40rpx;
    font-weight: 600;
    line-height: 40rpx;
    color: #333;
  }
  .dialog_body {
    flex: 1;
    width: 100%;
    height: 28rpx;
    font-size: 28rpx;
    line-height: 28rpx;
    color: #666;
    text-align: center;
    &.order_type {
      height: 36rpx;
      font-size: 36rpx;
      font-weight: 600;
      line-height: 36rpx;
      color: #333;
      .body_item {
        display: block;
        width: 100%;
        text-align: center;
        &.top {
          height: 36rpx;
          padding-bottom: 38rpx;
          line-height: 36rpx;
          border-bottom: 1px solid #d6d6d6;
        }
        &.bottom {
          height: 28rpx;
          padding-top: 28rpx;
          font-size: 28rpx;
          line-height: 28rpx;
          color: #666;
        }
      }
    }
  }
  .btn_list {
    box-sizing: border-box;
    width: 100%;
    padding: 0 40rpx;
    @include flex-between;
    &.center {
      @include flex-center;
    }
    .btn {
      box-sizing: border-box;
      width: 258rpx;
      height: 68rpx;
      margin: 0;
      font-size: 28rpx;
      line-height: 68rpx;
      color: #666;
      background-color: #fff;
      border: 1px solid #666;
      border-radius: 40rpx;
      &::after {
        border: none;
      }
      &.close {
        margin-right: 0 34rpx 0 0;
      }
      &.confirm {
        margin: 0;
        color: #fff;
        background-color: #da1a23;
        border: none;
      }
    }
  }
}
</style>
