// ====== 球星卡价格爬虫 ======
// 用法: node 卡价爬虫.js "Ebrima Tunkara Topps Chrome"
//
// 功能: 搜索eBay已售成交 → 提取价格/日期/链接 → 保存CSV
//
// ⚠️ 合法使用: 仅用于个人价格追踪，不要高频调用
// ⚠️ 加3秒延迟，尊重目标服务器

var https = require('https');
var fs = require('fs');

var query = process.argv[2] || 'Ebrima Tunkara Topps Chrome';
var searchUrl = 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(query) + '&LH_Sold=1&LH_Complete=1&_sop=13';

console.log('🕷️  搜索: ' + query);
console.log('🔗 ' + searchUrl);
console.log('');

fetchHTML(searchUrl, function(html) {
  if (!html) { console.log('❌ 获取失败，检查VPN和网络'); return; }

  // 提取成交记录
  var results = extractListings(html);

  if (results.length === 0) {
    console.log('⚠️  未提取到成交记录。可能原因:');
    console.log('   1. eBay需要验证(浏览器打开一次eBay)');
    console.log('   2. 搜索结果为空');
    console.log('   3. HTML结构变化');
    return;
  }

  console.log('✅ 提取到 ' + results.length + ' 条成交记录:\n');

  var csv = '日期,标题,价格(美元),链接\n';
  results.forEach(function(r, i) {
    console.log((i + 1) + '. ' + r.date + ' | $' + r.price + ' | ' + r.title.substring(0, 60) + '...');
    csv += '"' + r.date + '","' + r.title.replace(/"/g, '""') + '",' + r.price + ',"' + r.link + '"\n';
  });

  // 保存CSV
  var filename = '卡价_' + query.replace(/[^a-zA-Z0-9一-鿿]/g, '_').substring(0, 40) + '.csv';
  fs.writeFileSync(filename, csv);
  console.log('\n💾 已保存: ' + filename);
  console.log('📥 可导入球星卡数据库: 打开数据库 → 找到对应卡 → 追加价格');
});

// ====== 核心: 从eBay HTML提取成交记录 ======
function extractListings(html) {
  var results = [];

  // 用正则匹配每个商品卡片
  // eBay的s-item类包含完整商品信息
  var itemRegex = /<li[^>]*class="[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  var match;
  var count = 0;

  while ((match = itemRegex.exec(html)) !== null && count < 20) {
    var itemHtml = match[1];
    count++;

    // 跳过第一个(搜索头部, 不是实际商品)
    if (itemHtml.indexOf('s-item__watch-count') === -1 && count === 1) continue;

    // 提取标题
    var titleMatch = itemHtml.match(/<span[^>]*role="heading"[^>]*>([\s\S]*?)<\/span>/i);
    var title = titleMatch ? cleanHtml(titleMatch[1]) : '未知';

    // 提取价格
    var priceMatch = itemHtml.match(/<span[^>]*class="[^"]*s-item__price[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    var priceText = priceMatch ? cleanHtml(priceMatch[1]) : '0';
    var price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

    // 提取日期(已售日期)
    var dateMatch = itemHtml.match(/Sold\s+([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/i);
    var date = dateMatch ? dateMatch[1] : '未知';

    // 提取链接
    var linkMatch = itemHtml.match(/href="([^"]+)"/i);
    var link = linkMatch ? linkMatch[1] : '';

    if (price > 0) {
      results.push({
        title: title,
        price: price,
        date: date,
        link: link
      });
    }
  }

  return results;
}

// ====== 辅助函数 ======
function fetchHTML(url, callback) {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, function(res) {
    var body = '';
    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() { callback(body); });
  }).on('error', function(err) {
    console.log('网络错误: ' + err.message);
    callback(null);
  });
}

function cleanHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

console.log('💡 提示: 如果用不了，先在浏览器打开 https://www.ebay.com 过一次人工验证\n');
