var amapFile = require('../../libs/amap-wx.js');

// pages/navi/navi.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    distance: '', /*预计距离*/
    duration: '', /*预计时间*/
    polyline: [],
    marker: {},
    location: {},
    markers: [{
      iconPath: "/assets/images/startPoint.png",
      id: 0,
      latitude: 0,
      longitude: 0,
      width: 32,
      height: 32
    }, {
        iconPath: "/assets/images/endPoint.png",
      id: 1,
      latitude: 0,
      longitude: 0,
      width: 32,
      height: 32
    }],
  },

  //////////////////////////////////////////////////////////////////////////////////////////////
  // 获取步行数据
  getWalkInfo: function (marker, location) {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: 'dc00667331aebe4b6371e5bd2868e7e9' });
    return new Promise((resolve, reject) => {
      myAmapFun.getWalkingRoute({
        origin: `${location.lng},${location.lat}`,
        destination: `${marker.lng},${marker.lat}`,
        success: (data) => {
          let points = [];
          if (data.paths && data.paths[0] && data.paths[0].steps) {
            let steps = data.paths[0].steps;
            for (let i = 0; i < steps.length; i++) {
              let poLen = steps[i].polyline.split(';');
              for (let j = 0; j < poLen.length; j++) {
                points.push({
                  longitude: parseFloat(poLen[j].split(',')[0]),
                  latitude: parseFloat(poLen[j].split(',')[1])
                })
              }
            }
          }
          that.points = points;
          if (data.paths[0] && data.paths[0].distance){
            that.distance = data.paths[0].distance + '米';
          }
          if (data.paths[0] && data.paths[0].duration){
            that.duration = parseInt(data.paths[0].duration / 60) + '分钟';
          }
          return resolve();
        },
        fail: (error) => {
          console.log(error);
          return reject(error);
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 获取marker和location经纬度
    let { marker, location } = options;
    this.marker = JSON.parse(marker);
    this.location = JSON.parse(location);

    // 业务处理
    this.getWalkInfo(this.marker, this.location).then(() => {
      // 设置起点和终点经纬度
      let markers = this.data.markers;
      markers[0].latitude = this.location.lat;
      markers[0].longitude = this.location.lng;
      markers[1].latitude = this.marker.lat;
      markers[1].longitude = this.marker.lng;
      // 设置数据
      this.setData({
        marker: this.marker,
        location: this.location,
        distance: this.distance,
        duration: this.duration,
        polyline: [{
          points: this.points,
          color: "#0091ff",
          width: 6
        }],
        markers: markers,
      })
      // 地图缩放
      setTimeout(()=>{
        that.mapCtx.includePoints({
          padding: [10],
          points: this.points
        });
      }, 500)
    }).catch((error)=>{
      console.log(error);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('navi_map');
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