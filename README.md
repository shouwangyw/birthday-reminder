# 生日提醒（birthday-reminder）

一个手机端生日提醒应用，**Android 优先**，基于 uni-app（Vue 3 + Vite）开发，可从同一套代码扩展到微信小程序、H5 等平台。

## 核心功能

- 支持**阴历 / 阳历**生日，可标记阴历闰月。
- **一次设置，每年自动提醒**：按设定的提醒时间，在生日当天（或提前 N 天）提醒。
- 根据**称呼、备注、年龄、生肖**自动生成祝福语和表情包，支持一键复制。
- 本地数据持久化，重启不丢失。
- Android 使用本地通知提醒；小程序预留订阅消息入口。

## 技术选型说明

| 目标 | 选择 | 理由 |
| --- | --- | --- |
| Android 优先 + 可扩展小程序 | uni-app（Vue 3 + Vite） | 一套代码可编译 Android App、微信小程序、H5 等，最贴合“先安卓、后小程序”的需求 |
| 阴历/阳历转换 | solarlunar（已内置到 src/utils/solarlunar.js） | 覆盖 1900–2100 年，含闰月、生肖、干支、节气，零依赖 |
| 本地提醒 | App 端 plus.push.createMessage | uni-app 5+ App 的本地通知能力 |
| 数据存储 | uni.setStorageSync | 简单可靠的本地持久化 |

> 阴历转换库 solarlunar 已把源码放入 `src/utils/solarlunar.js`，避免运行时额外依赖，方便小程序端直接打包。

## 目录结构

```
birthday-reminder/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.vue                  # 应用入口：启动时重新调度提醒
    ├── main.js
    ├── manifest.json            # 应用配置（权限、App/小程序配置）
    ├── pages.json               # 页面与导航栏配置
    ├── uni.scss                 # 全局样式变量
    ├── pages/
    │   ├── index/index.vue      # 首页：生日列表（按临近天数排序）
    │   ├── add/add.vue          # 新增 / 编辑生日
    │   ├── detail/detail.vue    # 详情：倒计时 + 祝福语 + 表情
    │   └── settings/settings.vue # 默认设置 / 清除数据 / 说明
    └── utils/
        ├── solarlunar.js        # 阴历阳历转换（内置）
        ├── date.js              # 下一个生日计算、年龄、生肖、格式化
        ├── blessing.js          # 按称呼/备注生成祝福语与表情
        ├── storage.js           # 本地数据读写
        └── reminder.js          # 本地通知调度 / 小程序订阅占位
```

## 数据模型

每条生日提醒记录：

```js
{
  id: string,            // 唯一 ID
  name: string,          // 姓名
  appellation: string,   // 称呼，如：妈妈、朋友、同事
  birthday: {
    type: 'solar' | 'lunar', // 阳历 / 阴历
    year: number,        // 出生年（用于计算年龄）
    month: number,       // 1–12
    day: number,         // 1–31（阳历）或 1–30（阴历）
    isLeapMonth: boolean // 仅阴历：是否闰月
  },
  remindTime: string,    // 提醒时间，如 '09:00'
  advanceDays: number,   // 提前提醒天数（0/1/3/7）
  note: string,          // 备注，用于生成贴心祝福
  enabled: boolean       // 是否启用提醒
}
```

## 快速开始

### 方式一：HBuilderX（推荐，用于 Android 打包 / 小程序）

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)。
2. `文件 -> 导入 -> 从本地目录导入`，选择本项目目录。
3. 运行到手机或模拟器：`运行 -> 运行到手机或模拟器 -> 运行到 Android App 基座`。
4. 打包 Android APK：`发行 -> 原生App-云打包`（需登录 DCloud 并填写 AppID）。
5. 运行微信小程序：`运行 -> 运行到小程序模拟器 -> 微信开发者工具`。

### 方式二：npm / CLI（用于本地预览 H5、小程序、App 资源）

```bash
npm install

# H5 本地预览
npm run dev:h5

# 构建 H5
npm run build:h5

# 构建微信小程序（产物在 dist/build/mp-weixin）
npm run build:mp-weixin

# 构建 App 资源包（产物在 dist/build/app，再用 HBuilderX 打包）
npm run build:app
```

> 已在本地验证 `build:h5`、`build:mp-weixin`、`build:app` 三个命令均可成功编译。

## Android 本地提醒说明

- 应用启动 / 回到前台时会调用 `rescheduleAll()`，重新计算未来一年内每个生日的提醒时间，并通过 `plus.push.createMessage` 下发本地通知。
- 已开启的提醒会**每年自动重新调度**，无需重复设置。
- 首次安装后请在系统设置中允许“通知”权限；Android 13+ 已声明 `POST_NOTIFICATIONS` 权限。
- `manifest.json` 中已声明 `VIBRATE / WAKE_LOCK / RECEIVE_BOOT_COMPLETED / SCHEDULE_EXACT_ALARM` 等权限。

## 小程序订阅消息说明

微信小程序无法像 App 一样直接本地定时通知，需要：

1. 在微信公众平台申请**订阅消息**模板并拿到模板 ID。
2. 将模板 ID 填入 `src/utils/reminder.js` 的 `requestWeixinSubscribe` 中的 `templateId`。
3. 用户授权订阅后，把结果上报到自己的服务端，由服务端在生日当天调用微信订阅消息接口下发。

代码中已预留 `requestWeixinSubscribe(record)` 入口，接入后端即可。

## 祝福语生成逻辑

`src/utils/blessing.js` 中：

- 内置了妈妈、爸爸、爷爷、奶奶、朋友、闺蜜、兄弟、同事、老师等 20 余种称呼的专属祝福语和表情。
- 根据称呼生成称呼语（如“亲爱的妈妈”），根据姓名、年龄、生肖拼接祝福。
- 若填写了备注，会追加“还记得你的小心愿：……，祝它早日实现！”。
- 表情包按称呼与随机种子生成，每次稳定且贴合关系。
