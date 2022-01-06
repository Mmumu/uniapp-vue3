<template>
  <van-popup
    overlay-style="background: rgba(0,0,0,0.7)"
    :show="show && dateType"
    position="bottom"
    @close="closePopup"
  >
    <van-datetime-picker
      :title="title"
      :value="currentDate"
      :type="dateType"
      :min-date="minDate"
      :max-date="maxDate"
      :min-hour="minHour"
      :max-hour="maxHour"
      :min-minute="minMinute"
      :max-minute="maxMinute"
      @confirm="chooseSuccess"
      @cancel="closePopup"
    >
    </van-datetime-picker>
  </van-popup>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    dateType: {
      // | 'date'| 'time'| 'year-month'| 'month-day'| 'datehour'| 'datetime'
      type: String,
      default: '',
      required: true,
    },
    curDate: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    minDate: {
      type: Number,
      default: new Date().getTime(),
    },
    maxDate: {
      type: Number,
      default: new Date().setHours(23, 59, 59, 999),
    },
    minHour: {
      type: Number,
      default: 0,
    },
    maxHour: {
      type: Number,
      default: 23,
    },
    minMinute: {
      type: Number,
      default: 0,
    },
    maxMinute: {
      type: Number,
      default: 59,
    },
  },
  data() {
    return {}
  },

  computed: {
    currentDate() {
      if (this.dateType === 'time') {
        if (this.curDate) return this.curDate
        return this.$day().format('HH:mm')
      }
      return new Date().getTime()
    },
  },

  watch: {
    show(val) {
      if (val) {
        this.$emit('update:minDate', new Date().getTime())
      }
    },
  },

  methods: {
    chooseSuccess(value) {
      if (this.dateType === 'time') {
        this.$emit('chooseDate', value.detail)
        this.$emit('update:show', false)
        return
      }
      const nowTime = new Date().getTime()
      if (value.detail < nowTime) {
        return uni.showToast({
          title: `不可小于\r\n${this.$day().format('YYYY/MM/DD HH:mm')}`,
          icon: 'none',
          duration: 2000,
        })
      }
      this.$emit('chooseDate', value.detail)
    },
    closePopup() {
      this.$emit('update:show', false)
    },
  },
}
</script>
