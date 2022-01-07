import { vipLogin } from '@/api/common-api'
const WEEK_LIST = [
  '周日',
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '未知日期',
]
export default {
  onShareAppMessage() {
    return {
      title: '百达星系会员，独创以时间为衡量价值的会员体系',
      path: '/modules/member/my/index',
    }
  },
  methods: {
    // 获取token
    _getToken(needGet = false) {
      const isLeave = uni.getStorageSync('isLeave') || 0
      if (isLeave || needGet) {
        const brandType = uni.getStorageSync('brandType')
        const params: any = {
          username: uni.getStorageSync('openId'),
          password: uni.getStorageSync('sessionKey'),
          sourceType: 3,
        }
        if (brandType) params.brandType = brandType * 1
        vipLogin({ ...params }).then((res: any) => {
          if (res.data.code !== 200) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            return
          }
          uni.setStorageSync('isLeave', 0)
          uni.setStorageSync('token', res.data.data.access_token)
        })
      }
    },
    // 时间戳数组
    handleRestDate(date: string[]) {
      const start: number = new Date(Number(date[0])).setHours(0, 0, 0, 0)
      const end: number = new Date(Number(date[1])).setHours(0, 0, 0, 0)
      const count = parseInt(`${(end - start) / (24 * 3600 * 1000)}`, 10)
      const nowDate = new Date()
      const startDate = new Date(start)
      const endDate = new Date(end)
      const nowMonth = nowDate.getMonth()
      const startMonth = startDate.getMonth()
      const endMonth = endDate.getMonth()
      const nowDay = nowDate.getDate()
      const startDay = startDate.getDate()
      const endDay = endDate.getDate()
      const startWeek = startDate.getDay()
      const endWeek = endDate.getDay()

      let inTip = ''
      if (startMonth === nowMonth && startDay === nowDay) {
        inTip = '今日'
      } else if (startMonth === nowMonth && startDay - nowDay === 1) {
        inTip = '明日'
      } else {
        inTip = WEEK_LIST[startWeek]
      }

      let outTip = ''
      if (endMonth === nowMonth && endDay === nowDay) {
        outTip = '今日'
      } else if (endMonth === nowMonth && endDay - nowDay === 1) {
        outTip = '明日'
      } else {
        outTip = WEEK_LIST[endWeek]
      }

      return { count, inTip, outTip }
    },

    // 床型信息
    _detailBed(bedList: any) {
      let bedText = ''
      for (let i = 0; i < bedList.length; i++) {
        bedText +=
          (i !== 0 ? '+' : '') +
          bedList[i].bedTypeArea +
          'm*' +
          bedList[i].bedTypeCount
      }
      return bedText
    },

    // 处理房间面积信息
    _detailArea(areaMin: string, areaMax: string) {
      const area = areaMin == areaMax ? areaMax : areaMin + '-' + areaMax
      return area + 'm²'
    },

    // 处理早餐份数
    _detailBreakFast(val: string) {
      if (!val) return '无早餐'
      const breakFast: any = {
        0: '无早餐',
        1: '1份早餐',
        2: '2份早餐',
      }
      return breakFast[val]
    },
  },
}
