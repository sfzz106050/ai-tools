// ====== ZZ 的第一个爬虫脚本 ======
// 用法: node 爬虫测试.js
//
// 这个脚本演示了爬虫的三个核心步骤:
//   1. fetch(网址) → 获取网页数据
//   2. 解析数据 → 提取有用的部分
//   3. 保存到文件 → 以后可以导入数据库

var https = require('https');

console.log('🕷️  爬虫启动中...\n');

// ====== 例1: 从公开API获取数据 (最正规的方式) ======
console.log('--- 例1: 从公开API获取Exchange Rate ---');

function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// 获取公共汇率数据 (免费API, 无需注册)
fetchJSON('https://api.exchangerate-api.com/v4/latest/USD')
  .then(function(data) {
    console.log('✅ API请求成功!');
    console.log('   美元对人民币: ' + data.rates.CNY.toFixed(2));
    console.log('   美元对欧元:   ' + data.rates.EUR.toFixed(2));
    console.log('   数据时间:     ' + data.date);
    console.log('');
  })
  .catch(function(err) {
    console.log('⚠️  汇率API请求失败 (可能是网络问题): ' + err.message);
    console.log('');
  });

// ====== 例2: 模拟抓取网页内容 (实际爬虫的原理) ======
console.log('--- 例2: 模拟抓取网页HTML ---');

// 这是一个演示用的公开网页
https.get('https://httpbin.org/html', function(res) {
  var html = '';
  res.on('data', function(chunk) { html += chunk; });
  res.on('end', function() {
    // 提取标题 - 这就是爬虫的核心逻辑
    var titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    var bodyMatch = html.match(/<p[^>]*>(.*?)<\/p>/);

    console.log('✅ 网页抓取成功!');
    if (titleMatch) console.log('   标题: ' + titleMatch[1].trim());
    if (bodyMatch) console.log('   第一段: ' + bodyMatch[1].trim().substring(0, 100) + '...');
    console.log('');
    console.log('--- ====\n');

    // ====== 总结 ======
    console.log('🎉 爬虫测试完成!');
    console.log('');
    console.log('你刚看到了两个东西:');
    console.log('  1. 从API获取JSON数据 → 这是最正规的"拿数据"方式');
    console.log('  2. 从网页提取HTML内容 → 这是爬虫的基本原理');
    console.log('');
    console.log('以后你爬球星卡价格的逻辑:');
    console.log('  node 脚本 → fetch(卡淘搜索页) → 解析HTML → 提取价格 → 存CSV');
    console.log('  跟上面的例2完全一样, 换个网址 + 换提取规则。');
  });
}).on('error', function(err) {
  console.log('⚠️  网页抓取失败: ' + err.message);
  console.log('(这很正常, 国内访问部分网站需要VPN)');
  console.log('');
  console.log('🎉 测试完成! 例1已展示核心原理。');
});
