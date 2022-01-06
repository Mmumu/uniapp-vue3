import WXLogger from './wxLogger.js'

const Monitor = WXLogger.init({
  pid: 'f4wk0ix9q1@e24789759401561',
  region: 'cn', // 指定应用部署的地域：中国设为cn，海外地区靠近新加坡的设为sg。
  environment: process.env.VUE_APP_BL,
})
export default Monitor
