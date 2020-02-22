var app = getApp()
var hotapp = require('../../utils/hotapp.js');

Page({
  data: {
    tags: ['学习', '生活', '日常', '外语', '诗词'],
    hiddenmodalput: true,
    tagValue: '',
    items: []
  },

  loadData: function() {
    app.getTags(items => {
      if (items.length) {
        this.setData({
          items
        })
      } else {
        wx.showToast({
          title: '网络加载失败',
          icon: 'loading',
          duration: 2000
        })
      }
    })
  },

  onLoad: function() {
    this.loadData()

    wx.setNavigationBarTitle({
      title: '标签'
    })
  },

  deletaTags: function(e) {
    hotapp.del(e.target.dataset.key, (res) => {
      console.log(res)
      if (res.msg == 'success') {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })
        this.loadData()
      } else {
        wx.showToast({
          title: '再试试，可能网络有误',
          icon: 'loading',
          duration: 2000
        })
      }
    })
  },

  voteTitle: function(e) {
    this.data.tagValue = e.detail.value
  },

  bindTagCreate: function(event) {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },

  //取消按钮
  cancel: function() {
    this.setData({
      hiddenmodalput: true
    });
  },

  //确认
  confirm: function(event) {
    this.setData({
      hiddenmodalput: true
    })
    if (this.data.tagValue) {
      app.globalData.hotapp.post(app.globalData.hotapp.getPrefix('tags') + (new Date()).getTime(), this.data.tagValue, res => {
      // app.globalData.hotapp.post('tags_oo-JN5XfmK1EofAbSlL6F5NPnISo_' + (new Date()).getTime(), this.data.tagValue, res => {
        console.log(res)
        if (res.msg == 'success') {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          })
          this.loadData()
        } else {
          wx.showToast({
            title: '再试试，可能网络有误',
            icon: 'loading',
            duration: 2000
          })
        }
      })
    }
  },
})
