<template>
  <view class="page" v-if="record">
    <view class="head card">
      <text class="avatar">{{ avatar }}</text>
      <view class="head-info">
        <view class="name-row">
          <text class="name">{{ record.name }}</text>
          <text class="star" :class="{ on: record.favorite }" @tap="toggleFavorite">{{ record.favorite ? '⭐' : '☆' }}</text>
        </view>
        <text class="sub">{{ record.appellation }} · {{ next.age }}岁 · 属{{ next.zodiac }}</text>
        <text class="sub">{{ next.birthdayText }}</text>
      </view>
    </view>

    <view class="countdown card">
      <text class="cd-label">{{ next.isToday ? '🎉 就是今天！' : '距离生日还有' }}</text>
      <view v-if="!next.isToday" class="cd-row">
        <text class="cd-days">{{ next.daysLeft }}</text>
        <text class="cd-unit">天</text>
      </view>
      <text class="cd-date">提醒日期：{{ next.dateText }} {{ record.remindTime }}</text>
      <text class="cd-advance" v-if="advanceText">提醒安排：{{ advanceText }}</text>
    </view>

    <view class="blessing card">
      <view class="sec-title">💌 生日祝福</view>

      <view class="style-chips">
        <text
          class="style-chip"
          :class="{ active: styleFilter === s }"
          v-for="s in styles"
          :key="s"
          @tap="setStyle(s)"
        >{{ s }}</text>
      </view>

      <text class="blessing-text">{{ currentBlessing }}</text>
      <text class="emoji-pack">{{ emojis }}</text>

      <view class="actions">
        <button class="btn small ghost" @tap="nextBlessing">换一句</button>
        <button class="btn small" @tap="copyBlessing">复制祝福语</button>
      </view>
    </view>

    <view class="ops">
      <button class="btn primary" @tap="goEdit">编辑</button>
      <button class="btn danger" @tap="remove">删除</button>
    </view>
  </view>
</template>

<script>
import { getRecord, deleteRecord, loadRecords, saveRecord } from '../../utils/storage.js'
import { computeNextBirthday } from '../../utils/date.js'
import { generateBlessingList, generateEmojis, BLESSING_STYLES } from '../../utils/blessing.js'
import { rescheduleAll } from '../../utils/reminder.js'

const AVATAR_MAP = {
  '妈妈': '👩',
  '母亲': '👩',
  '爸爸': '👨',
  '父亲': '👨',
  '爷爷': '👴',
  '外公': '👴',
  '奶奶': '👵',
  '外婆': '👵',
  '老婆': '💑',
  '老公': '💑',
  '朋友': '🧑‍🤝‍🧑',
  '闺蜜': '👭',
  '兄弟': '👬',
  '同事': '🧑‍💼',
  '同学': '🎓',
  '孩子': '🧒',
  '儿子': '👦',
  '女儿': '👧',
  '老师': '🧑‍🏫',
  '领导': '🧑‍💼'
}

const ADVANCE_LABELS = { 0: '当天', 1: '提前1天', 3: '提前3天', 7: '提前7天' }

export default {
  data() {
    return {
      id: '',
      record: null,
      next: {},
      emojis: '',
      blessingList: [],
      styleFilter: '全部',
      currentIndex: 0,
      styles: BLESSING_STYLES
    }
  },
  computed: {
    avatar() {
      return AVATAR_MAP[this.record.appellation] || '🎂'
    },
    filtered() {
      if (this.styleFilter === '全部') return this.blessingList
      return this.blessingList.filter((b) => b.style === this.styleFilter)
    },
    currentBlessing() {
      const list = this.filtered
      if (!list.length) return ''
      if (this.currentIndex >= list.length) this.currentIndex = 0
      return list[this.currentIndex].text
    },
    advanceText() {
      const days = Array.isArray(this.record.advanceDays) ? this.record.advanceDays : [Number(this.record.advanceDays) || 0]
      return days.map((d) => ADVANCE_LABELS[d] || ('提前' + d + '天')).join('、')
    }
  },
  onLoad(options) {
    this.id = (options && options.id) || ''
    this.load()
  },
  onShow() {
    if (this.id) this.load()
  },
  methods: {
    load() {
      const record = getRecord(this.id)
      if (!record) {
        uni.showToast({ title: '记录不存在', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 400)
        return
      }
      this.record = record
      this.next = computeNextBirthday(record, new Date())
      this.blessingList = generateBlessingList(record, new Date())
      this.emojis = generateEmojis(record)
      this.currentIndex = 0
    },
    setStyle(s) {
      this.styleFilter = s
      this.currentIndex = 0
    },
    nextBlessing() {
      const len = this.filtered.length
      if (len) this.currentIndex = (this.currentIndex + 1) % len
    },
    copyBlessing() {
      uni.setClipboardData({
        data: this.currentBlessing,
        success: () => uni.showToast({ title: '已复制', icon: 'success' })
      })
    },
    toggleFavorite() {
      this.record.favorite = !this.record.favorite
      saveRecord(this.record)
      uni.showToast({ title: this.record.favorite ? '已收藏' : '已取消收藏', icon: 'none' })
    },
    goEdit() {
      uni.navigateTo({ url: '/pages/add/add?id=' + this.id })
    },
    remove() {
      uni.showModal({
        title: '删除提醒',
        content: '确定删除「' + this.record.name + '」的生日提醒吗？',
        confirmColor: '#ff6b6b',
        success: (res) => {
          if (res.confirm) {
            deleteRecord(this.id)
            rescheduleAll(loadRecords())
            uni.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 400)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.head {
  display: flex;
  align-items: center;
}
.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: #fff1ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-right: 26rpx;
}
.head-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.name-row {
  display: flex;
  align-items: center;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  color: #3b3030;
}
.star {
  font-size: 40rpx;
  margin-left: 16rpx;
  color: #d8cfcf;
}
.star.on {
  color: #ffb400;
}
.sub {
  font-size: 26rpx;
  color: #6b5d5d;
  margin-top: 8rpx;
}

.countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #fff1ee, #fff);
}
.cd-label {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 600;
}
.cd-row {
  display: flex;
  align-items: baseline;
  margin: 16rpx 0 8rpx;
}
.cd-days {
  font-size: 96rpx;
  font-weight: 800;
  color: #ff6b6b;
}
.cd-unit {
  font-size: 32rpx;
  color: #ff6b6b;
  margin-left: 8rpx;
}
.cd-date {
  font-size: 26rpx;
  color: #6b5d5d;
}
.cd-advance {
  font-size: 24rpx;
  color: #ff8a65;
  margin-top: 8rpx;
}

.sec-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3b3030;
  margin-bottom: 16rpx;
}
.style-chips {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 18rpx;
}
.style-chip {
  font-size: 24rpx;
  color: #6b5d5d;
  background: #f6f1f1;
  border-radius: 999rpx;
  padding: 8rpx 22rpx;
  margin: 0 16rpx 12rpx 0;
}
.style-chip.active {
  color: #fff;
  background: #ff6b6b;
}
.blessing-text {
  font-size: 30rpx;
  line-height: 1.7;
  color: #3b3030;
  white-space: pre-wrap;
}
.emoji-pack {
  display: block;
  font-size: 52rpx;
  margin-top: 20rpx;
  letter-spacing: 8rpx;
}
.actions {
  margin-top: 28rpx;
  display: flex;
}
.btn.small {
  flex: 1;
  background: #ff6b6b;
  color: #fff;
  border-radius: 999rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
  margin-right: 16rpx;
}
.btn.small.ghost {
  background: #fff;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
}

.ops {
  display: flex;
}
.btn.primary {
  flex: 1;
  background: #ff6b6b;
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  height: 92rpx;
  line-height: 92rpx;
  margin-right: 20rpx;
}
.btn.danger {
  flex: 1;
  background: #fff;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 999rpx;
  font-size: 30rpx;
  height: 92rpx;
  line-height: 92rpx;
}
</style>
