// import { VueConstructor } from 'vue/types/umd'
import dayjs from 'dayjs'
import store from '@/store/index'

export default {
  install(app: any) {
    app.config.globalProperties.$store = store
    app.config.globalProperties.$day = dayjs
  },
}
