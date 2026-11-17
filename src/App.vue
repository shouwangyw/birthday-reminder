<script>
import { loadRecords } from './utils/storage.js'
import { rescheduleAll, requestNotificationPermission } from './utils/reminder.js'

export default {
  onLaunch() {
    this.syncReminders()
    requestNotificationPermission()
  },
  onShow() {
    this.syncReminders()
  },
  methods: {
    syncReminders() {
      const records = loadRecords().filter((r) => r.enabled !== false)
      rescheduleAll(records)
    }
  }
}
</script>

<style>
page {
  background-color: #fff7f0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #3b3030;
}

button::after {
  border: none;
}
</style>
