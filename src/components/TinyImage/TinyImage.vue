<template>
  <image
    :src="tinyUrl"
    :style="{
      width: computedWidth,
      height: computedHeight,
      borderRadius: computedRadius,
    }"
    :lazy-load="lazyLoad"
    :mode="computedMode"
    :show-menu-by-longpress="showMenuByLongpress"
    @click="emmitEvent"
  ></image>
</template>
<script>
import { tiny } from '@/tiny/tiny'

const numericProp = [Number, String]

const isNumeric = (val) => typeof val === 'number' || /^\d+(\.\d+)?$/.test(val)

const isDef = (val) => val !== null && val !== undefined
function addUnit(value) {
  if (isDef(value)) {
    return isNumeric(value) ? `${value}rpx` : String(value)
  }
  return undefined
}

export default {
  name: 'tiny-image',
  props: {
    src: {
      type: String,
      required: true,
      default: '',
    },
    width: {
      type: Number,
      required: true,
      default: 0,
    },
    height: {
      type: Number,
      required: true,
      default: 0,
    },
    lazyLoad: {
      type: Boolean,
      default: false,
    },
    radius: {
      type: numericProp,
      default: 0,
    },
    scaleX: {
      type: Number,
      required: false,
      default: 0,
    },
    mode: {
      type: String,
      default: 'aspectFill',
      validator: function (value) {
        return value != 'true'
      },
    },
    showMenuByLongpress: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tinyUrl() {
      let options = Object.create(null)
      if (this.scaleX > 0) {
        options.width = this.scaleX
      }
      const destSrc = tiny.tinyUrl(this.src || '', options)

      return destSrc
    },
    computedMode() {
      if (this.tinyUrl === 'https://img.betterwood.com/default.png') {
        return 'scaleToFill'
      }
      if (this.mode === 'true' || this.mode === '') {
        return 'aspectFill'
      }
      return this.mode
    },
    computedRadius() {
      return addUnit(this.radius)
    },
    computedWidth() {
      if (this.width === 0) return 'inherit'
      const width = addUnit(this.width)
      return width ? width : 'inherit'
    },
    computedHeight() {
      if (this.height === 0) return 'inherit'
      const height = addUnit(this.height)
      return height ? height : 'inherit'
    },
  },
  methods: {
    emmitEvent() {
      this.$emit('clickCallback')
    },
  },
}
</script>
