// pages/index/index.js
const domain = "https://test.weiquaninfo.cn";
const controlsBottomHeight = 150;

// page
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isInfoShow: true,
    mapHeight: '100%',
    curMarker: {},
    mapRect: null,
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
    }, {
        id: 2,
        iconPath: "/assets/images/scienceLoc.png",
        position: {
          left: 30,
          top: 0,
          width: 40,
          height: 40
        },
        clickable: true
    }, {
        id: 3,
        iconPath: "/assets/images/refresh.png",
        position: {
          left: 0,
          top: 0,
          width: 40,
          height: 40
        },
        clickable: true
    }, {
      id: 4,
      iconPath: "/assets/images/scan.png",
      position: {
        left: 0,
        top: 50,
        width: 40,
        height: 40
      },
      clickable: true
    }, {
      id: 5,
      iconPath: "/assets/images/banner.png",
      position: {
        left: 5,
        top: 15,
        width: 300,
        height: 46
      },
      clickable: true
    }],
    polyline: [{
      points: [],
      color: "#52c41a",
      width: 2,
      dottedLine: true
    }],
    markers:[],
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 查看详情页
  onDetail: function(){
    wx.navigateTo({
      url: '/pages/detail/detail',
    })
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 点击map事件
  mapClick:function(){
    this.setData({ isInfoShow: false });
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 点击marker事件
  markertap: function (e) {
    let marker = this.data.markers[e.markerId];
    this.setData({ isInfoShow: true, curMarker: marker});
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
      case 2:
        this.mapCtx.includePoints({
          padding: [20],
          points: this.data.polyline[0].points
        });
        break;
      case 3:
        this.updateOverlayData();
        break;
      case 4:
        wx.scanCode({
          success: (res) => {
            console.log(res)
          }
        });
        break;
      default:
        break;
    }
  },

  /////////////////////////////////////////////////////////////////////////////////
  // 更新地图标记数据
  updateOverlayData: function(){
    wx.showLoading({title: "更新数据中", mask: true});
    setTimeout(()=>{
      // 更新区域
      this.getArea().then((points) => {
        this.points = points;
        return this.getMarkers();
      }).then((markers) => {
        // 最后渲染
        let polyline = this.data.polyline;
        polyline[0].points = this.points;
        this.setData({ polyline: polyline, markers: markers});
        wx.hideLoading();
      })
    }, 500)
  },

  ////////////////////////////////////////////////////////////////////////////////////
  // 设置地图控件位置
  setMapCtlPosition: function (mapRect){
    let controls = this.data.controls;
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].id == 1 || controls[i].id == 2) {
        // 左下方2个控件
        controls[i].position.top = mapRect.bottom - controlsBottomHeight - 40 * (i + 1) - 20 * i;
      } else if (controls[i].id == 3 || controls[i].id == 4) {
        // 右下方2个控件
        controls[i].position.top = controls[i - 2].position.top;
        controls[i].position.left = mapRect.right - 40 - 30;
      } else if (controls[i].id == 5) {
        // 顶部广告
        if (mapRect.width > 533) {
          controls[i].position.width = 533;
          controls[i].position.height = 81;
        } else if (mapRect.width > 410) {
          controls[i].position.width = 410;
          controls[i].position.height = 62;
        } else {
          controls[i].position.width = 370;
          controls[i].position.height = 56;
        }
        controls[i].position.left = (mapRect.width - controls[i].position.width) / 2;
      }
    }
    return controls;
  },

  ////////////////////////////////////////////////////////////////////////////////////
  // 获取并设置景区区域
  getArea: function(){
    return new Promise((resolve, reject) => {
      let url = `${domain}/mongo/polygons`;
      const requestTask = wx.request({
        url: url,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length == 0){
            // 空区域
            return resolve([]);
          }
          let points = [];
          res.data.map((item) => {
            points.push({
              longitude: item.lng,
              latitude: item.lat
            })
          });
          points.push(points[0]);/*首尾相连*/
          return resolve(points);
        }
      })
    })
  },

   ////////////////////////////////////////////////////////////////////////////////////
  // 获取并设置所有标记点
  getMarkers: function () {
    return new Promise((resolve, reject) => {
      let url = `${domain}/mongo/markers`;
      const requestTask = wx.request({
        url: url,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.length == 0) {
            // 无标记点
            return resolve([]);
          }
          let markers = [];
          res.data.map((item, index) => {
            let iconPath = "";
            if (item.type == "science"){
              // 类型为景点
              iconPath = "/assets/images/scienceType.png";
            }
            markers.push({
              id: index,
              iconPath: iconPath,
              longitude: item.lng,
              latitude: item.lat,
              width: 30,
              height: 30,
              callout:{
                content: item.name,
                display: 'BYCLICK',
                color: "white",
                fontSize: 12,
                borderRadius:10,
                bgColor: "black",
                padding: 10,
              },
              thumb: item.thumb,
              name: item.name,
              desp: item.desp,
              type: item.type,
            });
          });
          return resolve(markers);
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户经纬度
    wx.showNavigationBarLoading();
    this.getCurLocation().then((curLoc)=>{
      this.curLoc = curLoc;
      // 获取地图位置
      return this.getMapRect();
    }).then((mapRect)=>{
      // 设置地图控件
      this.mapRect = mapRect;
      this.controls = this.setMapCtlPosition(mapRect);
      return;
    }).then(()=>{
      //获取并设置景区区域
      return this.getArea();
    }).then((points)=>{
      this.points = points;
      // 获取并设置所有标记点
      return this.getMarkers();
    })
    .then((markers)=>{
      // 最后渲染
      let polyline = this.data.polyline;
      polyline[0].points = this.points;
      this.setData({ 
        curLoc: this.curLoc, 
        controls: this.controls, 
        polyline: polyline, 
        markers: markers,
        mapRect: this.mapRect
      });
      wx.hideNavigationBarLoading();
    })
    .catch((err)=>{
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