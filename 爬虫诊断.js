// 诊断: 抓取eBay原始HTML, 保存到文件查看
var https = require('https');
var fs = require('fs');

var url = 'https://www.ebay.com/sch/i.html?_nkw=Ebrima+Tunkara&LH_Sold=1&LH_Complete=1';

console.log('正在抓取: ' + url);

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9'
  }
}, function(res) {
  console.log('状态码: ' + res.statusCode);
  console.log('Content-Type: ' + res.headers['content-type']);

  var body = '';
  res.on('data', function(c) { body += c; });
  res.on('end', function() {
    fs.writeFileSync('ebay_debug.html', body);
    console.log('文件大小: ' + body.length + ' 字节');
    console.log('已保存到 ebay_debug.html');

    // 检查关键标记
    var checks = [
      { label: '有s-item', found: body.indexOf('s-item') !== -1 },
      { label: '有price', found: body.indexOf('s-item__price') !== -1 },
      { label: '有Sold', found: body.indexOf('Sold') !== -1 },
      { label: '有captcha', found: body.indexOf('captcha') !== -1 },
      { label: '有robot', found: body.indexOf('robot') !== -1 },
      { label: '有block', found: body.indexOf('block') !== -1 }
    ];

    console.log('\n诊断结果:');
    checks.forEach(function(c) {
      console.log('  ' + (c.found ? '✅' : '❌') + ' ' + c.label);
    });

    if (checks[3].found || checks[4].found) {
      console.log('\n⚠️  eBay要求人机验证。请在浏览器打开 https://www.ebay.com 过一次验证，再重试。');
    }
  });
}).on('error', function(e) {
  console.log('❌ 网络错误: ' + e.message);
  console.log('检查VPN是否开启');
});
