Page({
  data: {
    name:'',age:'',posIndex:0,
    positions:['前锋','边锋','攻击型中场','中场','防守型中场','边后卫','中后卫','门将'],
    brand:'',setName:'',year:'',number:'',price:'',
    showResult:false,shortDir:'',shortPrice:'',midDir:'',midPrice:'',advice:''
  },

  onNameInput:function(e){this.setData({name:e.detail.value})},
  onAgeInput:function(e){this.setData({age:e.detail.value})},
  onPosChange:function(e){this.setData({posIndex:parseInt(e.detail.value)})},
  onBrandInput:function(e){this.setData({brand:e.detail.value})},
  onSetInput:function(e){this.setData({setName:e.detail.value})},
  onYearInput:function(e){this.setData({year:e.detail.value})},
  onNumberInput:function(e){this.setData({number:e.detail.value})},
  onPriceInput:function(e){this.setData({price:e.detail.value})},

  onPredict:function(){
    var that=this;
    if(!this.data.name){wx.showToast({title:'请填写球员姓名',icon:'none'});return}

    // 简化版预测算法 (跟网页版同逻辑)
    var score=5+Math.random()*3; // demo用随机分数, 实际接入网页版算法
    var priceMid=parseFloat(this.data.price)||1000;

    this.setData({
      showResult:true,
      shortDir:score>=6.5?'看涨':'偏弱',
      shortPrice:Math.round(priceMid*(1+(score-5)*0.05)),
      midDir:score>=6?'看涨':'偏弱',
      midPrice:Math.round(priceMid*(1+(score-5)*0.12)),
      advice:score>=7?'BUY/HOLD':score>=5.5?'HOLD':'WATCH'
    })
  }
})
