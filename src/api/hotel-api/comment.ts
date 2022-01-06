import lsxmRequest from '@/plugins/request'
import { baseUrl, APP_URL, CONTENT_URL, VIP_URL } from '@/config'

/**
 * @method 获取评论详情接口
 * @param { string } id // 评论id
 */
interface ICommentDetail {
  id: string
}
export function getHotelCommentDetail(params: ICommentDetail) {
  return lsxmRequest.post(
    `${baseUrl}/bdw-content/hotel/comment/hotel/detail/get`,
    params
  )
}
/**
 * @method 回复评论接口
 * @param { string } contentId // 回复具体某条评论的id
 * @param { string } replyDetail // 回复内容
 */
interface ICommentReply {
  contentId: string
  replyDetail: string
}
export function commentReplyAdd(params: ICommentReply) {
  return lsxmRequest.post(
    `${baseUrl}/bdw-content/comment/comment/reply/add`,
    params
  )
}

/**
 * @method 根据类型获取客户端文件上传参数
 * @param {number} type // 1-酒店
 */
export function getAppClientOssKey(type = 1) {
  return lsxmRequest.get(`${APP_URL}/index/getAppClientOssKey`, { type })
}

/**
 * @method 新增评价
 */
interface ContentSub {
  hotelId: string
  hotelName: string
  roomId: string
  roomName: string
}

interface Media {
  coverUrl: string //封面地址
  type: number //类别（1视频，2图片）
  url: string //原型地址
}
interface Comment {
  completeTime: string //消费/入住时间
  commentDetail: string //评论内容
  media: Media[]
}

interface Grade {
  facilityScore: number //设施评分
  generalScore: number //总评
  locationScore: number //位置评分
  sanitaryScore: number //卫生评分
  serviceScore: number //服务评分
}

interface IContent {
  contentSubject: ContentSub[]
  orderChannel: number //订单渠道（1酒店、2剧本杀、3休息厅）
  orderId: string //订单id
  anonymous: number //匿名评价（0不匿名，1匿名）默认0
  comment: Comment
  grade: Grade
  tags: string[] //标签id数组
}
export function addContent(data: IContent) {
  return lsxmRequest.post(`${CONTENT_URL}/main/content/add`, data)
}

/**
 * @method 新增追价
 */
interface IAddiContent {
  orderChannel: number //订单渠道（1酒店、2剧本杀、3休息厅）
  orderId: string //订单id
  comment: Comment
}
export function additionContent(data: IAddiContent) {
  return lsxmRequest.post(`${CONTENT_URL}/main/content/additional/add`, data)
}

/**
 * @method 获取评价标签列表
 * @param {number} orderChannel
 */
export function getTagList(orderChannel = 1) {
  return lsxmRequest.post(
    `${CONTENT_URL}/comment/tags/list`,
    {
      orderChannel,
    },
    {
      header: {
        noLoading: 1,
      },
    }
  )
}

/**
 * @method 评价标签列表
 * @param { string } orderChannel 业务编号
 */
export const getFilterList = (data: any) => {
  return lsxmRequest.post(
    `${VIP_URL}/content/hotel/comment/hotel/filter/get`,
    data
  )
}

/**
 * @method 酒店评分信息
 * @param { string } hotelId 酒店id
 */
export const getHotelScore = (data: any) => {
  return lsxmRequest.post(`${VIP_URL}/content/hotel/score/hotel/get`, data)
}

/**
 * @method 点赞/取消点赞
 * @param { string } contentId 评论id
 */
export const changeCommentLike = (data: any) => {
  return lsxmRequest.post(
    `${VIP_URL}/content/comment/comment/like/change`,
    data
  )
}

/**
 * @method 酒店评价列表
 * @param { string } hotelId
 */
export const getHotelCommentList = (
  data: any,
  pageSize: number,
  pageNum: number
) => {
  return lsxmRequest.post(`${VIP_URL}/content/hotel/comment/hotel/list`, data, {
    header: {
      pageSize: pageSize,
      pageNum: pageNum,
    },
  })
}

/**
 * @method 酒店详情页评价信息
 * @param { string } hotelId
 */
export const getHotelDetailComment = (data: any) => {
  return lsxmRequest.post(
    `${VIP_URL}/content/hotel/comment/hotel/info/get`,
    data
  )
}
