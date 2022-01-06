<template>
  <view>
    <van-action-sheet :show="show" @close="onClose">
      <van-datetime-picker
        :value="currentDate"
        :min-date="minDate"
        :max-date="maxDate"
        :title="title"
        :type="dateType"
        :filter="filter"
        @input="onInput"
        @confirm="onConfirm"
        @cancel="onClose"
      ></van-datetime-picker>
    </van-action-sheet>
  </view>
</template>

<script>
export default {
  name: 'TimePicker',
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      //标题
      type: String,
      default: '',
    },
    dateType: {
      //类型，可选值为 date time year-month datetime
      type: String,
      default: 'time',
    },
    // 可选值 end 和 start 控制文案
    type: {
      type: String,
      default: 'start',
    },
    curDate: {
      //默认时间，date类型传-时间戳， time类型传-mm:ss
      type: String,
      default: '',
    },
    maxTime: {
      //可选最大时间, 如16:00
      type: String,
      default: '',
    },
    minTime: {
      //可选最小时间, 如12:00
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentDate: this.curDate,
    }
  },
  computed: {
    minDate() {
      let start = new Date().getFullYear() + '-01-01'
      let res = new Date(start).getTime()
      return res
    },
    maxDate() {
      let end = new Date().getFullYear() + 1 + '-12-31'
      let res = new Date(end).getTime()
      return res
    },
  },
  watch: {
    curDate: {
      handler(val) {
        if (!val) {
          if (this.dateType === 'date') {
            this.currentDate = new Date().getTime()
          } else if (this.dateType === 'time') {
            this.currentDate = this.$day().format('HH:mm:ss')
          }
        } else {
          if (this.dateType === 'date') {
            this.currentDate = new Date(val).getTime()
          } else if (this.dateType === 'time') {
            this.currentDate = val
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:show', false)
    },
    onInput(e) {},
    filter(type, options) {
      if (type === 'year') {
        const year = new Date().getFullYear()
        return options.filter((item) => item == year)
      }
      return options
    },
    onConfirm(e) {
      let detail = e.detail || ''
      let res = detail
      let curDate = this.curDate
      if (this.dateType === 'date') {
        //回传'2021-01-01'
        res = this.$day(detail).format('YYYY-MM-DD')
        this.currentDate = this.$day(detail).format('YYYY-MM-DD')
      } else {
        //判断最大最小时间
        if (this.maxTime) {
          if (res > this.maxTime) {
            this.currentDate = curDate + ':00'
            const tip = this.type === 'end' ? '结束' : '开始'
            this.onClose()
            uni.showToast({
              icon: 'none',
              title: `${tip}时间不能晚于${this.maxTime}`,
              duration: 2000,
            })
            return
          }
        }
        if (this.minTime) {
          if (res < this.minTime) {
            this.currentDate = curDate + ':00'
            this.onClose()
            uni.showToast({
              icon: 'none',
              title: `结束时间不能早于${this.minTime}`,
              duration: 2000,
            })
            return
          }
        }
      }
      this.$emit('update:curDate', res)
      this.$emit('onPick', detail)
      this.onClose()
    },
  },
}
</script>
