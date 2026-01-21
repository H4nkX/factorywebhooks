# 企业微信 Webhook 服务

这是一个部署在 Vercel 上的企业微信 webhook 服务，可以通过 HTTP 请求向企业微信群发送消息。支持配置多个 webhook，方便管理不同的群组。

## 功能特性

- 支持发送文本消息
- 支持发送 Markdown 消息
- 支持配置多个 webhook
- 部署在 Vercel 上，无需服务器
- 简单易用的 API 接口

## 项目结构

```
├── index.js          # 核心代码
├── package.json      # 项目配置
├── vercel.json       # Vercel 配置
└── README.md         # 项目说明
```

## 部署步骤

### 1. 准备工作

- 注册 [Vercel](https://vercel.com/) 账号
- 安装 [Git](https://git-scm.com/downloads)
- （可选）安装 [Node.js](https://nodejs.org/en/download/) 用于本地开发

### 2. 克隆项目

```bash
git clone <your-repo-url>
cd wechat-webhook-server
```

### 3. 配置 webhook

编辑 `index.js` 文件中的 `webhooks` 对象，添加或修改 webhook 配置：

```javascript
const webhooks = {
  default: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=f9d8171b-5d6f-4be2-a094-3a4aa65b7f27'
  },
  // 添加更多 webhook
  // another: {
  //   url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=another-key'
  // }
};
```

### 4. 部署到 Vercel

#### 方法一：通过 Vercel CLI 部署

1. 安装 Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. 登录 Vercel
   ```bash
   vercel login
   ```

3. 部署项目
   ```bash
   vercel
   ```

#### 方法二：通过 Vercel 官网部署

1. 访问 [Vercel 官网](https://vercel.com/)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 输入你的仓库 URL，点击 "Import"
5. 配置项目信息，点击 "Deploy"

## API 接口

### 发送文本消息

```bash
POST /api/send/:webhook?
Content-Type: application/json

{
  "content": "Hello, World!",
  "mentioned_list": ["user1", "user2"],
  "mentioned_mobile_list": ["13800138000"]
}
```

- `:webhook`：可选，指定使用哪个 webhook，默认为 `default`
- `content`：消息内容，必填
- `mentioned_list`：可选，@ 提及的用户列表
- `mentioned_mobile_list`：可选，@ 提及的手机号列表

### 发送 Markdown 消息

```bash
POST /api/send/markdown/:webhook?
Content-Type: application/json

{
  "content": "# Hello\n> This is a markdown message"
}
```

- `:webhook`：可选，指定使用哪个 webhook，默认为 `default`
- `content`：Markdown 内容，必填

### 健康检查

```bash
GET /health
```

## 响应格式

成功响应：

```json
{
  "errcode": 0,
  "errmsg": "ok"
}
```

失败响应：

```json
{
  "errcode": 错误码,
  "errmsg": "错误信息"
}
```

## 本地开发

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```

3. 访问 `http://localhost:3000/health` 检查服务是否正常运行

## 添加新的 webhook

要添加新的 webhook，只需在 `index.js` 文件中的 `webhooks` 对象中添加新的配置：

```javascript
const webhooks = {
  default: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=f9d8171b-5d6f-4be2-a094-3a4aa65b7f27'
  },
  // 新的 webhook
  marketing: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=marketing-key'
  },
  tech: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=tech-key'
  }
};
```

然后重新部署到 Vercel 即可使用新的 webhook：

```bash
POST /api/send/marketing
Content-Type: application/json

{
  "content": "Marketing team message"
}
```

## 注意事项

- 企业微信 webhook 有发送频率限制，请注意不要发送过于频繁
- 消息内容请遵守企业微信的相关规定
- 部署到 Vercel 后，服务会自动分配一个域名，可在 Vercel 控制台查看
- 如需使用自定义域名，请在 Vercel 控制台配置

## 故障排查

如果遇到 `invalid json request, wrong json format` 错误，请检查：
- 请求头是否设置了 `Content-Type: application/json`
- 请求体是否为有效的 JSON 格式
- 消息内容是否符合企业微信的要求

## 许可证

MIT License
