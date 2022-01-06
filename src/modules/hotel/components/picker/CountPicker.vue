<template>
  <view>
    <van-action-sheet :show="show" @close="onClose">
      <van-picker
        :title="title"
        :default-index="defaultInx"
        :columns="myColumns"
        :show-toolbar="true"
        @cancel="onClose"
        @confirm="onConfirm"
      ></van-picker>
    </van-action-sheet>
  </view>
</template>

<script>
export default {
  name: 'countPicker',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '次数选择',
    },
    columns: {
      type: Array,
      default() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
    },
    // 是数字类型时,默认选择
    count: {
      type: Number,
      default: 0,
    },
    // 是字符串类型时,默认选择
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      myColumns: this.columns,
    }
  },
  computed: {
    defaultInx() {
      if (this.type) {
        if (!this.columns.includes(this.type)) return
        return this.columns.indexOf(this.type)
      } else {
        let inx = this.myColumns.indexOf(this.count)
        if (inx === -1) {
          inx = 0
        }
        return inx
      }
    },
  },
  methods: {
    onClose() {
      this.$emit('update:show', false)
    },
    onConfirm(e) {
      let val = e.detail.value || 0

      this.type
        ? this.$emit('update:type', val)
        : this.$emit('update:count', val)
      this.onClose()
    },
  },
}
</script>
