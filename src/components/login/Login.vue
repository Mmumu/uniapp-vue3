<!--
 * @FileDescription: 百达屋会员系列公用登录组件
 * @Author: 李国璞
 * @Date: 2021/5/21
 -->
<template>
  <view class="login">
    <LtDialog
      v-if="showGetPhone"
      v-model:showType="showGetPhone"
      :rawData="rawData"
      :signature="signature"
      type="phone"
      titleText="请授权您的手机号"
      bodyText="授权后可获得更多的服务"
      confirmBtnText="授权"
      @getPhoneSuccess="getPhone"
    />
    <OrderDialog
      v-if="showRole"
      v-model:show="showRole"
      title="授权登录成为百达屋会员"
      bodyInfo="登录后可查看百达星系福利"
      closeBtnText="取消"
      confirmBtnText="登录/注册"
      :can-click="canClick"
      @confirm="toLogin"
    />
  </view>
</template>

<script>
import {
  getVipOpenId,
  vipLogin,
  getVipInfo,
  addVipInfo,
  updateVipInfo,
} from '@/api/common-api'

import LtDialog from '@/components/ltDialog/LtDialog'
import OrderDialog from '@/components/orderDialog/OrderDialog'
export default {
  name: 'Login',
  components: {
    LtDialog,
    OrderDialog,
  },
  props: {
    // 登录的type
    sourceType: {
      type: Number,
      default: 0,
    },
    needLogin: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: 'other',
    },
  },
  data() {
    return {
      rawData: '', // 拿电话号码的参数
      signature: '', // 拿电话号码的参数
      userInfo: null,
      canClick: true,
      showRole: false, // 授权成为百达屋会员
      showGetPhone: false, // 展示获取用户手机号的弹窗
    }
  },
  watch: {
    // 1. 进入时调用微信登录取到code
    needLogin(val) {
      if (val) {
        this.toWxLogin()
      }
    },
  },
  mounted() {
    this.toWxLogin()
  },
  methods: {
    toWxLogin() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      if (token && userInfo && this.from !== 'share') return
      this.wxLogin()
    },
    //1. 进入时调用微信登录取到code
    wxLogin() {
      wx.login({
        success: (data) => {
          if (data.code) {
            // 2. 解析code, 获取openid
            const appId = uni.getStorageSync('appId')
            getVipOpenId(data.code, appId).then((res) => {
              uni.setStorageSync('openId', res.data.openid)
              uni.setStorageSync('sessionKey', res.data.sessionKey)
              uni.setStorageSync('unionId', res.data.unionid)
              // 埋点
              this.$uma.setOpenid(res.data.openid)
              // 3. 查看用户信息
              this._getVipInfo(this.sourceType, res.data.openid)
            })
          }
        },
      })
    },

    // 获取用户信息接口
    _getVipInfo(type, openId) {
      const brandType = uni.getStorageSync('brandType')
      const params = {
        type,
        openId,
      }
      if (brandType) params.brandType = brandType * 1
      getVipInfo({ ...params })
        .then((res) => {
          if (res.data.code === 200 && res.data.data) {
            // 如果有用户信息,但是没有手机号
            this.userInfo = res.data.data
            if (!res.data.data.phone) {
              this.showGetPhone = true
              return
            } else {
              // 有用户信息, 说明是老用户, 直接登录
              this.showRole = false
              this.showGetPhone = false
              uni.setStorageSync('userInfo', res.data.data)
              uni.setStorageSync('user_id', res.data.data.id)
              uni.setStorageSync('phone', res.data.data.phone)
              if (res.data.data.brandType) {
                uni.setStorageSync('brandType', res.data.data.brandType)
              }
              this._vipLogin()
            }
          } else {
            // 没有用户信息, 并且不需要登录 直接return 否则弹窗进行登录
            if (!this.needLogin) return
            this.showRole = true
          }
        })
        .catch(() => {
          uni.showToast({
            title: '获取用户信息失败',
            icon: 'none',
            duration: 2000,
          })
        })
        .finally(() => {
          this.$emit('update:needLogin', false)
        })
    },

    // 登录接口
    _vipLogin() {
      const brandType = uni.getStorageSync('brandType')
      const params = {
        username: uni.getStorageSync('openId'),
        password: uni.getStorageSync('sessionKey'),
        sourceType: this.sourceType,
      }
      if (brandType) params.brandType = brandType * 1
      vipLogin({ ...params })
        .then((res) => {
          if (res.data.code === 200) {
            // 已经登录成功,获取到了token, 存储token
            uni.setStorageSync('token', res.data.data.access_token)
            uni.showToast({
              title: '登录成功',
              icon: 'none',
            })
            // 如果是龙腾 就插入航班记录
            // if (this.sourceType === 1 || this.from === 'rest') {
            //   this._insertFlightInfo()
            // }
          } else {
            // 登录失败,没有用户信息,重新注册,需要弹出授权百达屋会员
            uni.showToast({
              title: '登录失败,请重试',
              icon: 'none',
              duration: 2000,
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          const token = uni.getStorageSync('token')
          const param = token ? token : 'error'
          this.$emit('loginStatus', param)
        })
    },

    // 微信获取用户信息
    toLogin() {
      this.canClick = false
      wx.getUserProfile({
        desc: '业务需求',
        success: (res) => {
          this.rawData = res.rawData
          this.signature = res.signature
          this.showRole = false
          this.userInfo = res.userInfo
          this.showGetPhone = true
          this.canClick = true
        },
        fail: (err) => {
          this.canClick = true
        },
      })
    },

    // 获取微信用户手机号
    getPhone(data) {
      this.showGetPhone = false
      this.$set(this.userInfo, 'phone', data)
      if (this.userInfo.id) {
        // 如果此时userInfo有id, 说明以及有用户信息,只是数据库中没有phone, 调update
        this._updateVipInfo(data)
      } else {
        // 5.没有id, 说明完全是新用户, 走新增
        this._addVipInfo(this.userInfo)
      }
    },

    // 新增用户
    _addVipInfo(user) {
      const brandType = uni.getStorageSync('brandType') * 1
      const invitationId = uni.getStorageSync('invitationId')
      const aId = uni.getStorageSync('aId')
      const sId = uni.getStorageSync('sId')
      const params = {
        sourceType: this.sourceType,
        brandType,
        minappOpenId: uni.getStorageSync('openId'),
        unionId: uni.getStorageSync('unionId'),
        phone: user.phone,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        gender: user.gender || 0,
        subscribe: 0,
        isWebSysAdd: 0,
      }
      if (invitationId) {
        params.userId = invitationId
      }
      if (sId) {
        params.sId = sId
      }
      if (aId) {
        params.aId = aId
      }
      addVipInfo({ ...params })
        .then((res) => {
          if (res.data.code === 200) {
            // 新增成功, 重新登录
            const openId = uni.getStorageSync('openId')
            this._getVipInfo(this.sourceType, openId)
          } else {
            uni.showToast({
              title: res.data.msg || '注册失败',
              icon: 'none',
              duration: 2000,
            })
          }
        })
        .catch(() => {
          uni.showToast({
            title: '注册失败',
            icon: 'none',
            duration: 2000,
          })
        })
    },

    // 更新用户(主要手机号)
    _updateVipInfo(phone) {
      const params = {
        id: this.userInfo.id,
        sourceType: this.sourceType,
        phone,
        avatarType: 1,
      }
      updateVipInfo(params)
        .then((res) => {
          if (res.data.code === 200) {
            this._vipLogin()
          } else {
            this.showGetPhone = true
            uni.showToast({
              title: '获取手机号失败,请重试',
              icon: 'none',
              duration: 2000,
            })
          }
        })
        .catch(() => {})
    },
  },
}
</script>
