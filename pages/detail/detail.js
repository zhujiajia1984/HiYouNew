// pages/detail/detail.js
const backgroundAudioManager = wx.getBackgroundAudioManager();  // 背景音频管理控件
const domain = "https://test.weiquaninfo.cn";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curMarker: {},
    recommendMarkers: {},
    curAudioStatus: "/assets/images/pause.png",
    audioTime: {
      curTime: '',
      totalTime: '',
    },
    location: {},
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 跳转navi
  onNavi:function(){
    let marker = JSON.stringify({
      lng: this.data.curMarker.lng,
      lat: this.data.curMarker.lat
    });
    wx.navigateTo({
      url: `/pages/navi/navi?marker=${marker}&location=${this.location}`,
    })
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 跳转推荐marker
  onRecMarkerClick:function(e){
    wx.redirectTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}&location=${this.location}`
    })
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 获取推荐的markers数据
  getRecommendMarkers:function(marker){
    return new Promise((resolve, reject) => {
      let url = `${domain}/mongo/markers`;
      const requestTask = wx.request({
        url: url,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length == 0) {
            // 空区域
            return resolve([]);
          }
          let markers = [];
          res.data.map((item)=>{
            if (item._id != marker._id && markers.length < 2){
              markers.push(item);
            }
          })
          return resolve(markers);
        }
      })
    })
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 获取marker数据
  getMarkerInfo:function(id){
    return new Promise((resolve, reject)=>{
      let url = `${domain}/mongo/markers?id=${id}`;
      const requestTask = wx.request({
        url: url,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length == 0) {
            // 空区域
            return resolve([]);
          }
          return resolve(res.data[0]);
        }
      })
    })
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 点击播放/暂停音频
  onAudioClick: function(){
    if (backgroundAudioManager.paused){
      // 重新播放
      backgroundAudioManager.play();
    }else{
      // 暂停
      backgroundAudioManager.pause();
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 秒数转分钟秒格式
  secToMin: function (t) {
    return Math.floor(t / 60) + ":" + (t % 60 / 100).toFixed(2).slice(-2);
  },

  ////////////////////////////////////////////////////////////////////////////////////////
  // 初始化后台音乐播放器
  initBgAudio: function(marker){
    var that = this;
    backgroundAudioManager.title = marker.name;
    backgroundAudioManager.epname = "多倍通";
    backgroundAudioManager.singer = 'Hi游';
    backgroundAudioManager.webUrl = marker.audio[0].url;
    backgroundAudioManager.coverImgUrl = marker.thumb;
    backgroundAudioManager.src = marker.audio[0].url;
    backgroundAudioManager.onPlay(()=>{
      if (backgroundAudioManager.duration){
        let audioTime = that.data.audioTime;
        audioTime.totalTime = that.secToMin(backgroundAudioManager.duration);
        that.setData({ curAudioStatus: "/assets/images/pause.png", audioTime: audioTime });
      }
    });
    backgroundAudioManager.onPause(() => {
      that.setData({ curAudioStatus: "/assets/images/play.png" });
    });
    backgroundAudioManager.onStop(() => {
      that.setData({ curAudioStatus: "/assets/images/play.png" });
    });
    backgroundAudioManager.onEnded(() => {
      that.setData({ curAudioStatus: "/assets/images/play.png" });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id, location} = options;
    this.id = id;
    this.location = location;
    // console.log(this.location);
    if (typeof (id) == "undefined" || id == ""){
      // markerID不存在
      wx.showToast({
        title: 'markerID不存在',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    // 业务处理
    this.getMarkerInfo(id).then((marker)=>{
      this.marker = marker;
      return this.getRecommendMarkers(marker);
    }).then((recommendMarkers)=>{
      this.initBgAudio(this.marker);
      this.setData({ curMarker: this.marker, recommendMarkers: recommendMarkers});
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
    // 业务处理
    this.getMarkerInfo(this.id).then((marker) => {
      this.marker = marker;
      return this.getRecommendMarkers(marker);
    }).then((recommendMarkers) => {
      this.initBgAudio(this.marker);
      this.setData({ curMarker: this.marker, recommendMarkers: recommendMarkers });
      wx.stopPullDownRefresh();
    })
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