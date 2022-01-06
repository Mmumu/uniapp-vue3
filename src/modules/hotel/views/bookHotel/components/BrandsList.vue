<template>
  <view class="brands_list">
    <view
      v-for="item in brands"
      :key="item.id"
      class="brand_item"
      @click="toBrand(item.id)"
    >
      <view v-if="item.flag === 1">
        <image class="brand_img" :src="item.img" mode="" />
        <text class="brand_name">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BrandsList',
  props: {
    brands: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {}
  },
  methods: {
    toBrand(id) {
      this.$to(
        this.$to(`/modules/hotel/views/hotel-list/HotelList?brandId=${id}`)
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.brands_list {
  display: flex;
  flex-wrap: wrap;
  .brand_item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    margin-top: 40rpx;
    .brand_img {
      width: 100rpx;
      height: 100rpx;
      border-radius: 100%;
    }
    .brand_name {
      display: flex;
      justify-content: center;
      margin-top: 14rpx;
      font-size: 22rpx;
      font-weight: 500;
      color: #101010;
      white-space: nowrap;
    }
  }
}
</style>
