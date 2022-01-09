import WXLogger from './wxLogger.js'
console.log(process.env, 'process.env1')
console.log(import.meta.env, 'import.meta.env')
const Monitor = WXLogger.init({
  pid: 'f4wk0ix9q1@e24789759401561',
  region: 'cn', // 指定应用部署的地域：中国设为cn，海外地区靠近新加坡的设为sg。
  // environment: process.env.VUE_APP_BL,
  environment: import.meta.env.VUE_APP_BL,
})
export default Monitor
