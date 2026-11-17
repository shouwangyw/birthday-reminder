<template>
  <view class="page">
    <view class="form card">
      <view class="field">
        <text class="label">姓名</text>
        <input class="input" v-model="name" placeholder="请输入姓名" placeholder-class="ph" />
      </view>

      <view class="field">
        <text class="label">称呼</text>
        <input class="input" v-model="appellation" placeholder="如：妈妈 / 朋友 / 同事" placeholder-class="ph" />
      </view>
      <view class="chips">
        <text
          class="chip"
          :class="{ active: appellation === r }"
          v-for="r in relations"
          :key="r"
          @tap="appellation = r"
        >{{ r }}</text>
      </view>

      <view class="field">
        <text class="label">生日类型</text>
        <view class="seg">
          <view class="seg-item" :class="{ active: type === 'solar' }" @tap="setType('solar')">阳历</view>
          <view class="seg-item" :class="{ active: type === 'lunar' }" @tap="setType('lunar')">阴历</view>
        </view>
      </view>

      <view class="field">
        <text class="label">出生日期</text>
        <view class="pickers">
          <picker class="p" mode="selector" :range="yearRange" @change="onYearChange">
            <view class="p-value">{{ year }}年</view>
          </picker>
          <picker class="p" mode="selector" :range="monthRange" @change="onMonthChange">
            <view class="p-value">{{ month }}月</view>
          </picker>
          <picker class="p" mode="selector" :range="dayRange" @change="onDayChange">
            <view class="p-value">{{ day }}日</view>
          </picker>
        </view>
      </view>

      <view v-if="type === 'lunar'" class="field">
        <text class="label">闰月</text>
        <switch :checked="isLeapMonth" @change="isLeapMonth = $event.detail.value" color="#ff6b6b" />
      </view>

      <view class="field">
        <text class="label">提醒时间</text>
        <picker class="p-time" mode="time" :value="remindTime" @change="onTimeChange">
          <view class="p-value">{{ remindTime }}</view>
        </picker>
      </view>

      <view class="field column">
        <text class="label">提前提醒（可多选）</text>
        <view class="chips advance-chips">
          <text
            class="chip"
            :class="{ active: advanceDays.includes(o.value) }"
            v-for="o in advanceOptions"
            :key="o.value"
            @tap="toggleAdvance(o.value)"
          >{{ o.label }}</text>
        </view>
      </view>

      <view class="field">
        <text class="label">备注</text>
        <textarea class="textarea" v-model="note" placeholder="例如：喜欢百合花、最近在准备考试……（用于生成贴心祝福语）" placeholder-class="ph" :maxlength="200" />
      </view>

      <view class="field">
        <text class="label">收藏</text>
        <switch :checked="favorite" @change="favorite = $event.detail.value" color="#ff6b6b" />
      </view>

      <view class="field">
        <text class="label">启用提醒</text>
        <switch :checked="enabled" @change="enabled = $event.detail.value" color="#ff6b6b" />
      </view>
    </view>

    <button class="btn primary" @tap="save">保存</button>
  </view>
</template>

<script>
import { loadRecords, getRecord, saveRecord, genId, loadSettings } from '../../utils/storage.js'
import { rescheduleAll } from '../../utils/reminder.js'

export default {
  data() {
    return {
      id: '',
      name: '',
      appellation: '',
      type: 'solar',
      year: 1995,
      month: 1,
      day: 1,
      isLeapMonth: false,
      remindTime: '09:00',
      advanceDays: [0],
      note: '',
      favorite: false,
      enabled: true,
      yearRange: [],
      monthRange: [],
      dayRange: [],
      advanceOptions: [
        { value: 0, label: '当天' },
        { value: 1, label: '提前1天' },
        { value: 3, label: '提前3天' },
        { value: 7, label: '提前7天' }
      ],
      relations: ['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '老婆', '老公', '朋友', '闺蜜', '兄弟', '同事', '同学', '孩子', '儿子', '女儿', '老师', '领导']
    }
  },
  onLoad(options) {
    this.buildYearRange()
    this.buildMonthRange()
    this.applyDefaults()

    if (options && options.id) {
      this.id = options.id
      const record = getRecord(options.id)
      if (record) this.setFromRecord(record)
    }
    this.rebuildDayRange()
  },
  methods: {
    buildYearRange() {
      const cur = new Date().getFullYear()
      const arr = []
      for (let y = cur; y >= 1900; y--) arr.push(y)
      this.yearRange = arr
    },
    buildMonthRange() {
      this.monthRange = Array.from({ length: 12 }, (_, i) => i + 1)
    },
    applyDefaults() {
      const s = loadSettings()
      this.type = s.defaultBirthdayType || 'solar'
      this.remindTime = s.defaultRemindTime || '09:00'
      const d = s.defaultAdvanceDays
      this.advanceDays = Array.isArray(d) ? d.slice() : [Number(d) || 0]
      const cur = new Date().getFullYear()
      this.year = Math.max(1900, cur - 25)
    },
    maxDay() {
      if (this.type === 'lunar') return 30
      return new Date(this.year, this.month, 0).getDate()
    },
    rebuildDayRange() {
      const max = this.maxDay()
      this.dayRange = Array.from({ length: max }, (_, i) => i + 1)
      if (this.day > max) this.day = max
    },
    setType(t) {
      this.type = t
      if (t === 'lunar') this.isLeapMonth = false
      this.rebuildDayRange()
    },
    onYearChange(e) {
      this.year = this.yearRange[Number(e.detail.value)]
      this.rebuildDayRange()
    },
    onMonthChange(e) {
      this.month = this.monthRange[Number(e.detail.value)]
      this.rebuildDayRange()
    },
    onDayChange(e) {
      this.day = this.dayRange[Number(e.detail.value)]
    },
    onTimeChange(e) {
      this.remindTime = e.detail.value
    },
    toggleAdvance(value) {
      const idx = this.advanceDays.indexOf(value)
      if (idx >= 0) {
        if (this.advanceDays.length > 1) this.advanceDays.splice(idx, 1)
      } else {
        this.advanceDays.push(value)
        this.advanceDays.sort((a, b) => a - b)
      }
    },
    setFromRecord(r) {
      this.name = r.name || ''
      this.appellation = r.appellation || ''
      this.type = r.birthday.type || 'solar'
      this.year = r.birthday.year
      this.month = r.birthday.month
      this.day = r.birthday.day
      this.isLeapMonth = !!r.birthday.isLeapMonth
      this.remindTime = r.remindTime || '09:00'
      this.advanceDays = Array.isArray(r.advanceDays) ? r.advanceDays.slice() : [Number(r.advanceDays) || 0]
      this.note = r.note || ''
      this.favorite = r.favorite === true
      this.enabled = r.enabled !== false
    },
    save() {
      if (!this.name.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' })
        return
      }
      if (!this.appellation.trim()) {
        uni.showToast({ title: '请输入称呼', icon: 'none' })
        return
      }
      const record = {
        id: this.id || genId(),
        name: this.name.trim(),
        appellation: this.appellation.trim(),
        birthday: {
          type: this.type,
          year: this.year,
          month: this.month,
          day: this.day,
          isLeapMonth: this.type === 'lunar' ? this.isLeapMonth : false
        },
        remindTime: this.remindTime,
        advanceDays: this.advanceDays.length ? this.advanceDays : [0],
        note: this.note.trim(),
        favorite: this.favorite,
        enabled: this.enabled
      }
      saveRecord(record)
      rescheduleAll(loadRecords())
      uni.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 400)
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
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.field {
  display: flex;
  align-items: center;
  min-height: 100rpx;
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
  width: 170rpx;
  font-size: 28rpx;
  color: #3b3030;
  font-weight: 600;
  flex-shrink: 0;
}
.field.column .label {
  width: 100%;
  margin-bottom: 8rpx;
}
.input {
  flex: 1;
  font-size: 28rpx;
  color: #3b3030;
}
.ph {
  color: #c9bcbc;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  padding: 18rpx 0 24rpx 170rpx;
}
.advance-chips {
  padding-left: 0;
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
  font-size: 28rpx;
  color: #6b5d5d;
  padding: 14rpx 0;
  border-radius: 10rpx;
}
.seg-item.active {
  background: #ff6b6b;
  color: #fff;
}
.pickers {
  flex: 1;
  display: flex;
  justify-content: space-between;
}
.p {
  flex: 1;
  text-align: center;
}
.p-value {
  font-size: 28rpx;
  color: #3b3030;
  padding: 20rpx 0;
}
.p-time {
  flex: 1;
}
.textarea {
  flex: 1;
  height: 160rpx;
  font-size: 28rpx;
  color: #3b3030;
  padding-top: 20rpx;
}
.btn.primary {
  margin-top: 40rpx;
  background: #ff6b6b;
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  height: 92rpx;
  line-height: 92rpx;
}
</style>
