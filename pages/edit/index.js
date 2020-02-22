var app = getApp();
Page({
  data: {
    tags: ['学习', '生活', '日常', '外语', '诗词'],
    tagCurrent: null,
    tag: '',
    item: {
      key: "",
      date: "",
      value: {
        title: "",
        content: "",
        tag: ""
      },
      create_time: "",
      update_time: "",
      state: 1
    },
    isNew: false,
    focus: true,
    type: ''
  },

  bindTopSwitch: function(event) {
    this.setData({
      tagCurrent: event.currentTarget.dataset.tagcurrent
    })
    this.createSelectorQuery()
  },

  createSelectorQuery: function() {
    const query = wx.createSelectorQuery()
    query.select('.active').boundingClientRect()
    query.exec(response => {
      this.setData({
        tag: response[0]['dataset']['tagvalue']
      })
    })
  },

  /**
   * 页面首次加载事件
   */
  onLoad: function(options) {
    if (options.type == 'show') {
      wx.setNavigationBarTitle({
        title: '查看'
      })

      var item = this.data.item;

      if (options.key) {
        app.globalData.hotapp.get(options.key, response => {
          if (response.msg == 'success') {
            item.key = options.key;
            item.value.title = response.data.value.title;
            item.value.content = response.data.value.content;
            item.value.tag = response.data.value.tag;

            console.log(this.data)

            this.setData({
              item,
              type: options.type
            })
          } else {
            wx.showToast({
              title: '网络加载失败',
              icon: 'loading',
              duration: 2000
            })
          }
        })
      } else {
        item.value.title = options.title;
        item.value.content = options.content;
        item.value.tag = options.tag;

        this.setData({
          item,
          type: options.type
        })
      }
    } else if (options.type == 'share') {
      wx.setNavigationBarTitle({
        title: '查看'
      })

      var item = this.data.item;

      if (options.key) {
        app.globalData.hotapp.get(options.key, response => {
          if (response.msg == 'success') {
            item.key = options.key;
            item.value.title = response.data.value.title;
            item.value.content = response.data.value.content;
            item.value.tag = response.data.value.tag;

            this.setData({
              item,
              type: options.type
            })
          } else {
            wx.showToast({
              title: '网络加载失败',
              icon: 'loading',
              duration: 2000
            })
          }
        })
      } else {
        item.value.title = options.title;
        item.value.content = options.content;
        item.value.tag = options.tag;

        this.setData({
          item,
          type: options.type
        })
      }
    } else {

      var item = this.data.item;
      this.setData({
        item
      })
    }
  },

  /**
   * 页面渲染事件
   */
  onShow: function() {
    this.loadData(this.data.item.key);
    app.getTags(items => {
      var tags = this.data.tags
      items.forEach(function(item, index, arr) {
        tags.push(item.value)
      })
      this.setData({
        tags
      })
    })
  },

  /**
   * 保存数据事件
   */
  onSubmit: function(event) {
    this.createSelectorQuery()
    var item = this.data.item;
    item.value.title = event.detail.value.title;
    item.value.content = event.detail.value.content;
    item.value.tag = this.data.tag;
    this.setData({
      item: item
    });
    this.saveData();
  },

  /**
   * 请求服务器保存数据
   */
  saveData: function() {
    var item = this.data.item;
    var now = Date.parse(new Date()) / 1000;
    item.update_time = now;
    item.date = now;
    this.setData({
      item: item
    });
    console.log(this.data.item)
    app.store(this.data.item, function(res) {
      if (res) {
        wx.showToast({
          title: "保存成功"
        });
        //返回首页
        wx.navigateBack();
      } else {
        wx.showToast({
          title: "保存失败"
        });
      }
    });
  },

  /**
   * 删除记事本事件
   */
  onDelete: function(event) {
    console.log(this.data.item);
    app.destroy(this.data.item, function(res) {
      if (res) {
        wx.showToast({
          title: "删除成功"
        });
        wx.redirectTo({
          url: "../index/index"
        })
      } else {
        wx.showToast({
          title: "删除失败"
        });
      }
    });
  },

  /**
   * 获取数据
   */
  loadData: function(key) {
    var that = this;
    app.show(this.data.item.key, function(res) {
      console.log(res);
      var item = res;
      item.value.title = res.value.title;
      item.value.content = res.value.content;
      item.value.tag = res.value.tag;
      that.setData({
        item: item
      });
      for (var i = 0; i < that.data.tags.length; i++) {
        if (that.data.tags[i] == res.value.tag) {
          that.setData({
            item: res,
            tagCurrent: i
          });
        }
      }
    });
  }
});
