const express = require('express');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// 解析JSON请求体
app.use(express.json());

// 企业微信Webhook配置
const webhooks = {
  default: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=3dfeaca5-345e-474e-b619-ea5b10f877a8'
  }
};

// 频率限制配置
const rateLimit = {
  windowMs: 60000,
  max: 50,
  calls: {}
};

// 频率限制检查
function checkRateLimit(webhookName) {
  const now = Date.now();
  if (!rateLimit.calls[webhookName]) rateLimit.calls[webhookName] = [];
  rateLimit.calls[webhookName] = rateLimit.calls[webhookName].filter(t => now - t < rateLimit.windowMs);
  if (rateLimit.calls[webhookName].length >= rateLimit.max) return false;
  rateLimit.calls[webhookName].push(now);
  return true;
}

// 发送消息到企业微信
function sendToWechat(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    try {
      const postData = JSON.stringify(message);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(webhookUrl, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`企业微信响应解析失败: ${data}`));
          }
        });
      });

      req.on('error', e => reject(e));
      req.write(postData);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

// 根路径POST路由（处理GitHub Actions转发的Trendminer消息）
app.post('/', async (req, res) => {
  try {
    const webhook = webhooks.default;
    if (!checkRateLimit('default')) {
      return res.status(200).json({ status: "ok", message: "频率限制，稍后重试" });
    }

    // 时间格式化（上海时区）
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Shanghai'
    });

    // 核心微调：将前端传的字符串化tm_data转成JSON对象（增加容错）
    let tmData = {};
    try {
      tmData = JSON.parse(req.body.tm_data); // 解析字符串为JSON
    } catch (e) {
      tmData = req.body.tm_data; // 解析失败则直接使用原始数据
    }

    // 从解析后的tmData中获取字段（替代原req.body，增加容错）
    const {
      monitorId, resultEnd, resultId, resultScore, resultStart,
      resultUrl, searchCreator, searchDescription, searchId,
      searchName, searchType, webhookCallEvent, webhookCallTime
    } = tmData;

    // 构建消息内容
    const content = `TrendMiner 监控告警
监控ID: ${monitorId || '未知'}
搜索ID: ${searchId || '未知'}
结果ID: ${resultId || '未知'}
结果分数: ${resultScore || '未知'}
搜索名称: ${searchName || '未知'}
搜索类型: ${searchType || '未知'}
创建人: ${searchCreator || '未知'}
搜索描述: ${searchDescription || '未知'}
事件类型: ${webhookCallEvent || '未知'}
结果开始时间: ${resultStart || '未知'}
结果结束时间: ${resultEnd || '未知'}
触发时间: ${webhookCallTime || '未知'}
查看详情: ${resultUrl || '无链接'}
本地接收时间：${timestamp}`;

    // 发送到企业微信
    const wechatResult = await sendToWechat(webhook.url, {
      msgtype: 'text',
      text: { content: `请注意有问题\n${content}` }
    });

    res.status(200).json({
      status: "ok",
      message: "消息已发送到企业微信",
      wechatResult
    });
  } catch (error) {
    console.error('服务错误:', error);
    res.status(200).json({
      status: "processed",
      message: "处理中，已记录错误",
      error: error.message
    });
  }
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ errcode: 0, errmsg: "ok" });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`服务启动在 ${PORT} 端口`);
});

module.exports = app;
