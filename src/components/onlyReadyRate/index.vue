<template>
  <view class="main">
    <!-- 空白星星 -->
    <view class="star_line">
      <view v-for="(star, index) in total" :key="index" class="star-wrapper">
        <image
          class="start"
          :style="{
            width: size + 'px',
            height: size + 'px',
          }"
          src="@/static/common/star.svg"
          mode=""
        />
      </view>
    </view>
    <!-- 选中星星 -->
    <view
      class="choose-star-line"
      :style="{
        width: `${starLineWidth}px`,
      }"
    >
      <view v-for="(star, index2) in total" :key="index2" class="star-wrapper">
        <image
          :style="{
            width: size + 'px',
            height: size + 'px',
          }"
          src="@/static/common/choose-star.svg"
          mode=""
        />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    rateScore: {
      type: Number,
      default: 3.2,
    },
    total: {
      type: Number,
      default: 5,
    },
    size: {
      type: Number,
      default: 11,
    },
  },
  computed: {
    starLineWidth() {
      let a = 0
      a =
        (parseInt(this.rateScore) - 1) * 3 +
        parseInt(this.rateScore) * this.size
      if (this.rateScore - parseInt(this.rateScore) > 0) {
        let b =
          ((this.rateScore * 10 - parseInt(this.rateScore) * 10) / 10) *
          this.size
        a = a + b + 3
      }
      return a
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  .star_line {
    overflow: hidden;
    white-space: nowrap;
  }
  .choose-star-line {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    overflow: hidden;
    white-space: nowrap;
  }
}
.star-wrapper {
  display: inline-block;
  margin-right: 3px;
  &:last-child {
    margin-right: 0;
  }
}
</style>
