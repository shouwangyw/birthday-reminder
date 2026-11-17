<template>
  <view class="page">
    <view class="filter-bar">
      <text class="filter-tab" :class="{ active: filter === 'all' }" @tap="setFilter('all')">全部</text>
      <text class="filter-tab" :class="{ active: filter === 'fav' }" @tap="setFilter('fav')">⭐ 收藏</text>
    </view>

    <view v-if="todayList.length" class="hero">
      <text class="hero-emoji">🎂</text>
      <view class="hero-body">
        <text class="hero-title">今天有人过生日啦</text>
        <text class="hero-names">{{ todayNames }}</text>
      </view>
      <text class="hero-arrow" @tap.stop="goDetail(todayList[0].id)">送祝福 ›</text>
    </view>

    <view v-if="list.length" class="list">
      <view class="card" :class="{ off: !item.enabled }" v-for="item in filteredList" :key="item.id" @tap="goDetail(item.id)">
        <view class="avatar">{{ item.avatar }}</view>
        <view class="info">
          <view class="row1">
            <text class="name">{{ item.name }}</text>
            <text class="tag">{{ item.appellation }}</text>
            <text v-if="item.isToday" class="today-badge">今天</text>
            <text v-if="!item.enabled" class="off-badge">已停用</text>
            <text class="card-star" :class="{ on: item.favorite }" @tap.stop="toggleFavorite(item.id)">{{ item.favorite ? '⭐' : '☆' }}</text>
          </view>
          <text class="birthday">{{ item.birthdayText }}</text>
          <text class="meta">{{ item.age }}岁 · 属{{ item.zodiac }}</text>
        </view>
        <view class="right">
          <text class="days" :class="{ hot: item.isToday }">{{ item.daysText }}</text>
          <text class="date">{{ item.dateText }}</text>
        </view>
      </view>

      <view class="footer">
        <text @tap="goSettings">⚙️ 设置与提醒说明</text>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-emoji">🎂</text>
      <text class="empty-title">还没有添加生日</text>
      <text class="empty-sub">添加亲友的生日，一次设置，每年自动提醒</text>
      <button class="btn primary" @tap="goAdd">添加第一个生日</button>
      <view class="footer">
        <text @tap="goSettings">⚙️ 设置与提醒说明</text>
      </view>
    </view>

    <view class="fab" @tap="goAdd">＋</view>
  </view>
</template>

<script>
import { loadRecords, saveRecords } from '../../utils/storage.js'
import { computeNextBirthday } from '../../utils/date.js'
import { generateEmojis } from '../../utils/blessing.js'

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

export default {
  data() {
    return {
      list: [],
      todayList: [],
      filter: 'all'
    }
  },
  onShow() {
    this.refresh()
  },
  onPullDownRefresh() {
    this.refresh()
    uni.stopPullDownRefresh()
  },
  computed: {
    todayNames() {
      return this.todayList.map((i) => i.appellation + i.name).join('、')
    },
    filteredList() {
      if (this.filter === 'fav') return this.list.filter((i) => i.favorite)
      return this.list
    }
  },
  methods: {
    refresh() {
      const records = loadRecords()
      const today = new Date()
      const list = records
        .map((r) => {
          const next = computeNextBirthday(r, today)
          const daysText = next.isToday ? '今天' : next.daysLeft === 1 ? '明天' : next.daysLeft + '天后'
          return {
            id: r.id,
            name: r.name,
            appellation: r.appellation,
            avatar: AVATAR_MAP[r.appellation] || '🎂',
            emojis: generateEmojis(r),
            birthdayText: next.birthdayText,
            dateText: next.dateText,
            daysLeft: next.daysLeft,
            daysText,
            age: next.age,
            zodiac: next.zodiac,
            isToday: next.isToday,
            enabled: r.enabled !== false,
            favorite: r.favorite === true
          }
        })
        .sort((a, b) => {
          if (a.daysLeft === null) return 1
          if (b.daysLeft === null) return -1
          return a.daysLeft - b.daysLeft
        })
      this.list = list
      this.todayList = list.filter((i) => i.isToday)
    },
    setFilter(f) {
      this.filter = f
    },
    toggleFavorite(id) {
      const records = loadRecords()
      const rec = records.find((r) => r.id === id)
      if (rec) {
        rec.favorite = !rec.favorite
        saveRecords(records)
        this.refresh()
      }
    },
    goAdd() {
      uni.navigateTo({ url: '/pages/add/add' })
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/detail/detail?id=' + id })
    },
    goSettings() {
      uni.navigateTo({ url: '/pages/settings/settings' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
  box-sizing: border-box;
}
.filter-bar {
  display: flex;
  margin-bottom: 20rpx;
}
.filter-tab {
  font-size: 26rpx;
  color: #6b5d5d;
  background: #fff;
  border-radius: 999rpx;
  padding: 10rpx 30rpx;
  margin-right: 16rpx;
}
.filter-tab.active {
  color: #fff;
  background: #ff6b6b;
}
.hero {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ff8a65, #ff6b6b);
  color: #fff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.35);
}
.hero-emoji {
  font-size: 72rpx;
  margin-right: 24rpx;
}
.hero-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.hero-title {
  font-size: 34rpx;
  font-weight: 700;
}
.hero-names {
  font-size: 26rpx;
  opacity: 0.95;
  margin-top: 6rpx;
}
.hero-arrow {
  font-size: 26rpx;
  background: rgba(255, 255, 255, 0.25);
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
}
.list {
  display: flex;
  flex-direction: column;
}
.card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 26rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #fff1ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-right: 22rpx;
  flex-shrink: 0;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.row1 {
  display: flex;
  align-items: center;
}
.name {
  font-size: 32rpx;
  font-weight: 700;
  color: #3b3030;
}
.tag {
  font-size: 22rpx;
  color: #ff6b6b;
  background: #ffece8;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  margin-left: 14rpx;
}
.today-badge {
  font-size: 20rpx;
  color: #fff;
  background: #ff6b6b;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  margin-left: 12rpx;
}
.off-badge {
  font-size: 20rpx;
  color: #a89898;
  background: #f0ecec;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  margin-left: 12rpx;
}
.card-star {
  font-size: 32rpx;
  margin-left: auto;
  color: #d8cfcf;
  padding: 0 4rpx;
}
.card-star.on {
  color: #ffb400;
}
.birthday {
  font-size: 26rpx;
  color: #6b5d5d;
  margin-top: 8rpx;
}
.meta {
  font-size: 24rpx;
  color: #a89898;
  margin-top: 4rpx;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.days {
  font-size: 30rpx;
  font-weight: 700;
  color: #ff6b6b;
}
.days.hot {
  color: #ff3b3b;
}
.date {
  font-size: 22rpx;
  color: #a89898;
  margin-top: 6rpx;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 180rpx;
}
.empty-emoji {
  font-size: 120rpx;
}
.empty-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #3b3030;
  margin-top: 28rpx;
}
.empty-sub {
  font-size: 26rpx;
  color: #a89898;
  margin-top: 12rpx;
}
.btn.primary {
  margin-top: 40rpx;
  background: #ff6b6b;
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  padding: 0 64rpx;
  height: 88rpx;
  line-height: 88rpx;
}
.footer {
  text-align: center;
  margin-top: 30rpx;
  color: #a89898;
  font-size: 24rpx;
}
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8a65, #ff6b6b);
  color: #fff;
  font-size: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 28rpx rgba(255, 107, 107, 0.45);
  z-index: 20;
}
</style>
