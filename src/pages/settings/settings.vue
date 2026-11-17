<template>
  <view class="page">
    <view class="card">
      <view class="sec-title">默认设置</view>

      <view class="field">
        <text class="label">默认提醒时间</text>
        <picker class="p-time" mode="time" :value="defaultRemindTime" @change="onTimeChange">
          <view class="p-value">{{ defaultRemindTime }}</view>
        </picker>
      </view>

      <view class="field column">
        <text class="label">默认提前提醒（可多选）</text>
        <view class="chips">
          <text
            class="chip"
            :class="{ active: defaultAdvanceDays.includes(o.value) }"
            v-for="o in advanceOptions"
            :key="o.value"
            @tap="toggleAdvance(o.value)"
          >{{ o.label }}</text>
        </view>
      </view>

      <view class="field">
        <text class="label">默认生日类型</text>
        <view class="seg">
          <view class="seg-item" :class="{ active: defaultBirthdayType === 'solar' }" @tap="setType('solar')">阳历</view>
          <view class="seg-item" :class="{ active: defaultBirthdayType === 'lunar' }" @tap="setType('lunar')">阴历</view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="sec-title">关于与说明</view>
      <view class="tips">
        <text class="tip">• 支持阴历 / 阳历生日，一次设置，每年自动提醒。</text>
        <text class="tip">• 支持一次生日多个提醒（当天、提前 1/3/7 天可多选）。</text>
        <text class="tip">• Android 端使用本地通知，需允许“通知”权限；应用每次打开时会自动重新调度未来一年的提醒。</text>
        <text class="tip">• 祝福语可切换风格（温馨 / 幽默 / 正式），并支持收藏。</text>
      </view>
    </view>

    <view class="card">
      <button class="btn danger" @tap="clearAll">清除全部数据</button>
    </view>
  </view>
</template>

<script>
import { loadSettings, saveSettings, saveRecords } from '../../utils/storage.js'

export default {
  data() {
    return {
      defaultRemindTime: '09:00',
      defaultAdvanceDays: [0],
      defaultBirthdayType: 'solar',
      advanceOptions: [
        { value: 0, label: '当天' },
        { value: 1, label: '提前1天' },
        { value: 3, label: '提前3天' },
        { value: 7, label: '提前7天' }
      ]
    }
  },
  onLoad() {
    const s = loadSettings()
    this.defaultRemindTime = s.defaultRemindTime || '09:00'
    this.defaultBirthdayType = s.defaultBirthdayType || 'solar'
    const d = s.defaultAdvanceDays
    this.defaultAdvanceDays = Array.isArray(d) ? d.slice() : [Number(d) || 0]
  },
  methods: {
    persist() {
      saveSettings({
        defaultRemindTime: this.defaultRemindTime,
        defaultAdvanceDays: this.defaultAdvanceDays,
        defaultBirthdayType: this.defaultBirthdayType
      })
      uni.showToast({ title: '已保存', icon: 'success' })
    },
    onTimeChange(e) {
      this.defaultRemindTime = e.detail.value
      this.persist()
    },
    toggleAdvance(value) {
      const idx = this.defaultAdvanceDays.indexOf(value)
      if (idx >= 0) {
        if (this.defaultAdvanceDays.length > 1) this.defaultAdvanceDays.splice(idx, 1)
      } else {
        this.defaultAdvanceDays.push(value)
        this.defaultAdvanceDays.sort((a, b) => a - b)
      }
      this.persist()
    },
    setType(t) {
      this.defaultBirthdayType = t
      this.persist()
    },
    clearAll() {
      uni.showModal({
        title: '清除数据',
        content: '确定删除全部生日提醒吗？此操作不可恢复。',
        confirmColor: '#ff6b6b',
        success: (res) => {
          if (res.confirm) {
            saveRecords([])
            uni.showToast({ title: '已清除', icon: 'success' })
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
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.sec-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3b3030;
  margin-bottom: 8rpx;
}
.field {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  border-bottom: 1rpx solid #f5ecec;
}
.field.column {
  flex-direction: column;
  align-items: stretch;
  padding-top: 20rpx;
}
.field:last-child {
  border-bottom: none;
}
.label {
  width: 220rpx;
  font-size: 28rpx;
  color: #3b3030;
  flex-shrink: 0;
}
.field.column .label {
  width: 100%;
  margin-bottom: 8rpx;
}
.chips {
  display: flex;
  flex-wrap: wrap;
}
.chip {
  font-size: 24rpx;
  color: #6b5d5d;
  background: #f6f1f1;
  border-radius: 999rpx;
  padding: 10rpx 22rpx;
  margin: 0 16rpx 16rpx 0;
}
.chip.active {
  color: #fff;
  background: #ff6b6b;
}
.p-time {
  flex: 1;
}
.p-value {
  font-size: 28rpx;
  color: #3b3030;
  padding: 20rpx 0;
  text-align: right;
}
.seg {
  flex: 1;
  display: flex;
  background: #f6f1f1;
  border-radius: 12rpx;
  padding: 6rpx;
}
.seg-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #6b5d5d;
  padding: 12rpx 0;
  border-radius: 10rpx;
}
.seg-item.active {
  background: #ff6b6b;
  color: #fff;
}
.tips {
  display: flex;
  flex-direction: column;
  margin-top: 12rpx;
}
.tip {
  font-size: 26rpx;
  line-height: 1.7;
  color: #6b5d5d;
  margin-bottom: 8rpx;
}
.btn.danger {
  background: #fff;
  color: #ff6b6b;
  border: 1rpx solid #ff6b6b;
  border-radius: 999rpx;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
}
</style>
