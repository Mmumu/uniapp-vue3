<template>
  <view class="comment-container">
    <view class="user-info">
      <tiny-image
        class="avatar"
        :src="
          comment.anonymousSign === 1
            ? 'https://img.betterwood.com/app/user/default.png'
            : comment.userInfo.avatarUrl
        "
        :scaleX="150"
        :radius="'50%'"
        mode="aspectFill"
      />
      <view class="right-info">
        <view v-if="comment.anonymousSign === 1" class="name">匿名用户</view>
        <view v-else class="name">{{ comment.userInfo.nickName }}</view>
        <van-rate
          :value="comment.hotelScore.generalScore"
          size="22rpx"
          readonly
          icon="/static/common/choose-star.svg"
          void-icon="/static/common/star.svg"
        />
      </view>
    </view>
    <view v-if="comment.comment" class="time">
      <text
        >{{ $day(comment.comment.completeTime).format('YYYY-MM-DD') }}入住，{{
          $day(comment.comment.createTime).format('YYYY-MM-DD')
        }}发表｜{{ comment.roomType }}</text
      >
    </view>
    <view v-if="comment.comment.commentDetail" class="comment-wrapper">
      <text
        :style="{ '-webkit-line-clamp': isTextVisible ? 'none' : lineClamNum }"
        class="text"
      >
        {{ comment.comment.commentDetail }}
      </text>
      <view
        v-if="isTextOver && !isTextVisible"
        class="all-text"
        @click.stop="changeTextVisible"
        >全文</view
      >
      <view
        v-if="isTextOver && isTextVisible"
        class="all-text"
        @click.stop="changeTextVisible"
        >收起</view
      >
    </view>
    <CommentImgWrap
      :comment="comment.comment"
      :isBriefPhoto="isBriefPhoto"
      @click.native.stop
    ></CommentImgWrap>
    <view v-if="comment.comment.merchantReply" class="hotel-revert">
      <text
        class="hotel-text"
        :style="{ '-webkit-line-clamp': isHotelTextVisible ? 'none' : 2 }"
      >
        <text style="font-weight: 500">酒店回复：</text>
        <text>{{ comment.comment.merchantReply }}</text>
      </text>
      <view
        v-if="isHotelTextOver && !isHotelTextVisible"
        style="color: #007aff"
        @click.stop.prevent="onHotelText"
        >全文</view
      >
      <view
        v-if="isHotelTextOver && isHotelTextVisible"
        style="color: #007aff"
        @click.stop.prevent="onHotelText"
        >收起</view
      >
    </view>
    <!-- 追评内容 -->
    <view v-if="isShowAddComment">
      <view v-if="comment.comment.additionalComment" class="additional-review">
        <text
          class="review-text"
          :style="{
            '-webkit-line-clamp': isAdditionalReviewVisible ? 'none' : 2,
          }"
        >
          <text style="font-weight: 500">追加评价：</text>
          <text>{{
            comment.comment.additionalComment &&
            comment.comment.additionalComment.commentDetail
          }}</text>
        </text>

        <view
          v-if="isAdditionalReviewOver && !isAdditionalReviewVisible"
          style="color: #007aff"
          @click.stop.prevent="onClickReviewText"
          >全文</view
        >
        <view
          v-if="isAdditionalReviewOver && isAdditionalReviewVisible"
          style="color: #007aff"
          @click.stop.prevent="onClickReviewText"
          >收起</view
        >
      </view>
      <view
        v-if="
          !isShowAddCommentImg &&
          comment.comment.additionalComment &&
          comment.comment.additionalComment.hasMedia === 1
        "
        class="add-comment-tip"
        @click="onClickComment(comment.id)"
      >
        追评图片/视频
        <van-icon class="tip-arrow" size="12" name="arrow" />
      </view>
      <CommentImgWrap
        v-if="isShowAddCommentImg"
        :comment="comment.comment.additionalComment"
      ></CommentImgWrap>
    </view>
    <!-- 插槽 -->
    <slot></slot>
    <view v-if="isNeedLike || isNeedComment" class="like-evaluate">
      <view
        v-if="isNeedLike"
        class="dislike-like"
        @click.stop.prevent="onClickLike(comment)"
      >
        <image
          v-if="!comment.disLike"
          class="dislike-icon"
          src="~@/static/common/dislike.png"
          mode=""
        />
        <image
          v-if="comment.disLike"
          class="dislike-icon"
          src="~@/static/common/like.png"
          mode=""
        />
        <view>{{ comment.likeCount }}</view>
      </view>
      <view
        v-if="isNeedComment"
        class="comment-icon-wrapper"
        @click="onClickComment(comment.id)"
      >
        <image
          class="comment-icon"
          src="~@/static/common/comment.png"
          mode=""
        />
        <view>{{ comment.replyCount }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import CommentImgWrap from '@/components/comment/CommentImgWrap.vue'
import TinyImage from '../TinyImage/TinyImage.vue'
export default {
  components: { CommentImgWrap, TinyImage },
  props: {
    lineClamNum: {
      type: Number,
      default: 5,
    },
    comment: {
      type: Object,
      default: () => {},
    },
    isNeedLike: {
      type: Boolean,
      default: false,
    },
    isNeedComment: {
      type: Boolean,
      default: false,
    },
    isBriefPhoto: {
      type: Boolean,
      default: false,
    },
    // 是否展示追评
    // 酒店详情中使用该组件，不展示追评的（文字 & 图片）相关内容
    isShowAddComment: {
      type: Boolean,
      default: false,
    },
    // 是否展示追评的图片
    // 评论列表中使用该组件，只展示追评文字，不展示追评图片
    isShowAddCommentImg: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isTextVisible: true,
      isTextOver: false,
      isHotelTextVisible: true,
      isHotelTextOver: false,
      isAdditionalReviewVisible: true,
      isAdditionalReviewOver: false,
    }
  },
  mounted() {
    const query = wx.createSelectorQuery().in(this)
    const LineHeight = 22 // 行高
    query.select('.text').boundingClientRect()
    query.exec((res) => {
      // console.log('res[text].review-text: ', res)
      if (res[0]) {
        const LineNum = res[0].height / LineHeight // 行数
        if (LineNum >= 6) {
          this.isTextVisible = false
          this.isTextOver = true
        }
      }
    })

    const queryHotel = wx.createSelectorQuery().in(this)
    queryHotel.select('.hotel-text').boundingClientRect()
    queryHotel.exec((res) => {
      // console.log('res[0].hotel-text: ', res)
      if (res[0]) {
        const LineNum = res[0].height / LineHeight // 行数
        if (LineNum > 2) {
          this.isHotelTextVisible = false
          this.isHotelTextOver = true
        }
      }
    })
    const queryReview = wx.createSelectorQuery().in(this)
    queryReview.select('.review-text').boundingClientRect()
    queryReview.exec((res) => {
      // console.log('res[0].review-text: ', res)
      if (res[0]) {
        const LineNum = res[0].height / LineHeight // 行数
        if (LineNum > 2) {
          this.isAdditionalReviewVisible = false
          this.isAdditionalReviewOver = true
        }
      }
    })
  },
  methods: {
    onClickComment(id) {
      this.$emit('gotoCommentDetail', id)
    },
    onClickLike(comment) {
      this.$emit('onChangeLike', comment)
    },
    onClick(index) {},
    changeTextVisible() {
      this.isTextVisible = !this.isTextVisible
    },
    onHotelText() {
      this.isHotelTextVisible = !this.isHotelTextVisible
    },
    onClickReviewText() {
      this.isAdditionalReviewVisible = !this.isAdditionalReviewVisible
    },
  },
}
</script>

<style lang="scss" scoped>
.comment-container {
  margin: 32rpx 32rpx 0 32rpx;
  .user-info {
    @include flex-align;
    .avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
    }
    .right-info {
      margin-left: 16rpx;
      .name {
        font-size: 24rpx;
        font-weight: 500;
        color: #333;
      }
    }
  }
  .time {
    margin-top: 20rpx;
    font-size: 22rpx;
    color: #999;
  }
  .comment-wrapper {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #333;
    .text {
      display: -webkit-box;
      overflow: hidden;
      line-height: 1.5;
      text-overflow: ellipsis;
      word-break: break-all;
      // background: #fff;
      -webkit-box-orient: vertical;
    }
    .all-text {
      font-size: 28rpx;
      color: #007aff;
    }
  }
  .hotel-revert {
    padding: 32rpx;
    font-size: 28rpx;
    color: #333;
    background: #fafafa;
    border-radius: 12rpx;
    .hotel-text {
      display: -webkit-box;
      overflow: hidden;
      line-height: 1.5;
      text-overflow: ellipsis;
      word-break: break-all;
      -webkit-box-orient: vertical;
    }
  }
  .additional-review {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #333;
    .review-text {
      display: -webkit-box;
      overflow: hidden;
      line-height: 1.5;
      text-overflow: ellipsis;
      word-break: break-all;
      -webkit-box-orient: vertical;
    }
  }
  .add-comment-tip {
    display: flex;
    align-items: center;
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #333;
  }
  .like-evaluate {
    display: flex;
    justify-content: flex-end;
    padding-top: 22rpx;
    padding-bottom: 32rpx;
    line-height: 0;
    .dislike-like {
      @include flex-align;

      font-size: 24rpx;
      color: #666;
      .dislike-icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 8rpx;
      }
    }
    .comment-icon-wrapper {
      @include flex-align;

      margin-left: 56rpx;
      font-size: 24rpx;
      color: #666;
      .comment-icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 8rpx;
      }
    }
  }
}
</style>
