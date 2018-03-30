// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curLoc:{
      lng: "121.47402763366699",
      lat: "31.230325651975548"
    },
    controls:[{
      id: 1,
      iconPath: "/assets/images/location.png",
      position: {
        left: 30,
        top: 0,
        width: 40,
        height: 40
      },
      clickable: true
    }]
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 获取当前经纬度
  getCurLocation: function(){
    return new Promise((resolve, reject)=>{
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          let curLoc = {
            lng: res.longitude,
            lat: res.latitude
          }
          return resolve(curLoc);
        },
        fail: (err) => {
          return reject(err);
        }
      })
    })
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 获取地图组件位置
  getMapRect: function () {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery().select('#map').boundingClientRect(function (rect) {
        return resolve(rect);
      }).exec()
    })
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 点击地图控件事件
  controltap:function(e){
    switch (e.controlId){
      case 1:
        this.mapCtx.moveToLocation();
        break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户经纬度
    wx.showNavigationBarLoading();
    this.getCurLocation().then((curLoc)=>{
      this.setData({ curLoc: curLoc});
      // 获取地图位置
      return this.getMapRect();
    }).then((mapRect)=>{
      // 设置地图控件位置
      let controls = this.data.controls;
      for (let i = 0; i < controls.length; i++){
        controls[i].position.top = mapRect.bottom - 50 - 40*(i+1);
      }
      this.setData({ controls: controls });
      wx.hideNavigationBarLoading();
    }).catch((err)=>{
      console.log(err);
      wx.hideNavigationBarLoading();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('map');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})