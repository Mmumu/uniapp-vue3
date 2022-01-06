// 手机号正则
export const isPhone = (phone: string) => {
  const phoneReg = new RegExp('^1[123456789]\\d{9}$')
  return phoneReg.test(phone)
}

// 邮箱正则
export const isEmail = (email: string) => {
  const emailReg = new RegExp(
    '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$'
  )
  return emailReg.test(email)
}

// 身份证正则
export const isCard = (idCard: string) => {
  const cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return cardReg.test(idCard)
}

// 处理富文本
export const handleRichText = (str: string) => {
  const arrEntities: any = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' }
  return str
    .replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
      return arrEntities[t]
    })
    .replace('<section', '<div')
    .replace('<img', '<img style="max-width:100%;height:auto" ')
    .replace('blob:', '')
}
/**
 * @method
 * @desc 节流方法
 * @param {function} fn 节流回调的方法
 * @param {number} wait 节流的时间差， 500毫秒内不会触发第二次方法
 */
export function throttle(fn: any, wait = 500) {
  let timer: any = null
  return function () {
    if (!timer) {
      const args = arguments
      /** @ts-ignore */
      const that = this
      timer = setTimeout(() => {
        /** @ts-ignore */
        fn.call(this, args)
        // 执行完后将timer清掉
        timer = null
      }, wait)
    }
  }
}

// 防抖函数
export function debounce(fn: any, wait = 500, isImmediate = false) {
  let timerId: any = null
  let flag = true
  if (isImmediate) {
    return function () {
      clearTimeout(timerId)
      if (flag) {
        /** @ts-ignore */
        fn.apply(this, arguments)
        flag = false
      }
      timerId = setTimeout(() => {
        flag = true
      }, wait)
    }
  }

  return function () {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      /** @ts-ignore */
      fn.apply(this, arguments)
    }, wait)
  }
}

// 比较时间
export const compareTime = (date: string) => {
  let newDate = date
  if (newDate.indexOf('-') >= 0) {
    newDate = date.replace(/\-/g, '/')
  }
  const firstTime = new Date(newDate).getTime()
  const endTime = new Date().getTime()
  return firstTime > endTime
}

/**
 * @method
 * @desc 计算两个时间差，单位/秒
 * @param {number} timestampStar 开始时间
 * @param {number} timestampEnd 结束时间
 * @returns {string} 返回 00:00:00 的字符串
 */
export const calLinkHour = (timestampStar: number, timestampEnd: number) => {
  const dur = timestampEnd - timestampStar
  let h = Math.floor(dur / 60 / 60).toString()
  if (h.length < 2) {
    h = '0' + h
  }
  let m = Math.floor((dur % 3600) / 60).toString()
  if (m.length < 2) {
    m = '0' + m
  }
  let s = Math.floor(dur % 60).toString()
  if (s.length < 2) {
    s = '0' + s
  }
  return h + ':' + m + ':' + s
}

// 周几
export const getWeek = (week: '0' | '1' | '2' | '3' | '4' | '5' | '6') => {
  const obj = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
  }
  return obj[week]
}

// 节假日
export const formatHoliday = (day: any) => {
  if (day.type === 'start') {
    day.bottomInfo = '入住'
  } else if (day.type === 'end') {
    day.bottomInfo = '离店'
  }
  return day
}

// 数字添加千分号
export const numFormat = (num: number) => {
  return num.toLocaleString('en-US')
}

// 处理二维码参数
interface IQuery {
  [key: string]: any
}
export const getScene = (str: string) => {
  const obj: IQuery = new Object()
  const newStr = decodeURIComponent(str).split('&')
  for (let i = 0; i < newStr.length; i++) {
    const item: any = newStr[i].split('=')
    obj[item[0]] = item[1]
  }
  return obj
}

const toDecimal2 = (x: string) => {
  let f = parseFloat(x)
  if (isNaN(f)) {
    return false
  }
  f = Math.round(Number(x) * 100) / 100
  let s = f.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}
export const pointsToYuan = (fen: number, dealNegative: boolean = true) => {
  let num: string = fen * 0.01 + ''
  const reg =
    num.indexOf('.') > -1
      ? /(\d{1,3})(?=(?:\d{3})+\.)/g
      : /(\d{1,3})(?=(?:\d{3})+$)/g
  num = num.replace(reg, '$1')
  let price = Number(toDecimal2(num))
  if (dealNegative && price < 0) {
    price = 0
  }
  return price
}

export const yuanToPoints = (yuan: number, digit: number = 100) => {
  let m = 0
  const s1 = yuan.toString(),
    s2 = digit.toString()
  try {
    m += s1.split('.')[1].length
  } catch (e) {}
  try {
    m += s2.split('.')[1].length
  } catch (e) {}
  return (
    (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
    Math.pow(10, m)
  )
}
