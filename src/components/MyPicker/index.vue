<template>
  <van-action-sheet :show="show" :round="round" @click-overlay="onCancel">
    <van-picker
      :show-toolbar="toolBar"
      :title="title"
      :value-key="valKey"
      :columns="columns"
      @cancel="onCancel"
      @confirm="onConfirm"
    />
  </van-action-sheet>
</template>

<script>
export default {
  name: 'MyPicker',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    round: {
      type: Boolean,
      default: false,
    },
    toolBar: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
      default() {
        return []
      },
    },
    title: {
      type: String,
      default: '',
    },
    valKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  options: {
    styleIsolation: 'shared',
  },
  methods: {
    onCancel() {
      this.$emit('update:show', false)
    },
    onConfirm(e) {
      this.$emit('choose', e.detail.value)
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .van-picker {
  .van-picker__cancel {
    font-size: 32rpx;
    color: #999;
  }
  .van-picker__confirm {
    font-size: 32rpx;
    color: #0bb25b;
  }
  .van-picker-column__item {
    width: 686rpx;
    margin: 0 auto;
    font-size: 36rpx;
    color: #999;
    &.van-picker-column__item--selected {
      color: #333;
      background-color: #eeeeef;
      border-radius: 16rpx;
    }
  }
}
</style>
