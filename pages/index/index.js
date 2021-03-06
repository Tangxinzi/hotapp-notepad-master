var app = getApp();

Page({
  data: {
    items: [],
    tags: [],
    tagCurrent: 0,
    itemCurrent: 0,
    swiperItemHeight: 0,
  },

  bindTagSwitch: function(event) {
    this.setData({
      tagCurrent: event.currentTarget.dataset.tagcurrent
    })
    this.createSelectorQuery()
  },

  bindChange: function(event) {
    this.setData({
      itemCurrent: event.detail.current
    })

    this.createSelectorSwiperQuery()
  },

  createSelectorQuery: function() {
    const query = wx.createSelectorQuery()
    query.select('.tags .active').boundingClientRect()
    query.exec(response => {
      this.onLoadData(response[0]['dataset']['tagvalue'])
    })
  },

  createSelectorSwiperQuery: function () {
    const query = wx.createSelectorQuery()
    query.select('.swiperActive').boundingClientRect()
    query.exec(response => {
      console.log(response[0]['height'])
      this.setData({
        swiperItemHeight: response[0]['height']
      })
    })
  },

  bindTopSwitch: function(event) {
    this.setData({
      itemCurrent: event.currentTarget.dataset.itemcurrent
    })

    this.createSelectorSwiperQuery()
  },

  /**
   * 首次渲染事件
   */
  onShow: function() {
    app.getTags(items => {
      var tags = ['全部', '学习', '生活', '日常', '外语', '诗词']
      items.forEach(function(item, index, arr) {
        tags.push(item.value)
      })
      this.setData({
        tags
      })
    })

    this.setData({
      items: []
    });

    app.globalData.hotapp.wxlogin((res) => {
      this.onLoadData();
    });
  },

  /**
   * 新增笔记事件
   */
  onNewItem: function(event) {
    wx.navigateTo({
      url: "../create/index"
    })
  },

  /**
   * 编辑笔记事件
   */
  onEditItem: function(event) {
    wx.navigateTo({
      url: '../edit/index?type=show&key=' + event.currentTarget.dataset.key
    })
  },

  onDelete: function (event) {
    app.show(event.target.dataset.key, function(res) {
      app.destroy(res, function(res) {
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
    });
  },

  onShareAppMessage: function (event) {
    return {
      title: '随手笔记',
      path: `/pages/edit/index?key=${ event.target.dataset.key }&title=${ event.target.dataset.title }&content=${ event.target.dataset.content }&type=share`,
      success: function () {
      },
      fail: function () { }
    }
  },

  /**
   * 获取数据事件
   */
  onLoadData: function(tag) {
    app.getItems(items => {
      console.log(items);
      if (tag == '全部' || tag == undefined) {
        this.setData({
          items: items
        });
      } else {
        var tags = []
        for (var i = 0; i < items.length; i++) {
          if (items[i]['value']['tag'] == tag) {
            tags.push(items[i]);
          }
        }
        console.log(tag, tags);
        this.setData({
          items: tags
        });
      }
    });
  },

  /**
   * 下拉刷新事件, 数据同步
   */
  onPullDownRefresh: function() {
    wx.showToast({
      title: '正在同步数据',
      icon: 'loading'
    });

    // 临时变量
    var tempData = this.data.items;
    var that = this;
    // 先检查版本, 如果和服务器版本不同, 则需要从服务器拉取数据
    app.checkVersion(function(shouldPullData) {
      if (shouldPullData) {
        var filters = {
          prefix: app.globalData.hotapp.getPrefix('item')
        };
        // 从服务器拉取所有数据
        app.globalData.hotapp.searchkey(filters, function(res) {
          if (res.ret == 0) {
            // 拉取成功, 更新版本号
            app.updateVersion(function(success) {
              if (success) {
                // 更新版本号之后把本地数据和服务器数据合并去重
                tempData = that.syncServerDatatoLocal(tempData, res.data.items);
                tempData.forEach(function(item, index, arr) {
                  arr[index] = app.formatItem(item);
                  arr[index].state = 2;
                });
                // 更新视图数据
                that.setData({
                  items: tempData
                });
                // 把合并好的数据存缓存

                wx.setStorageSync('items', tempData);
                that.syncLocalDataToServer(tempData);
              }
            });
          }
        });
      } else {
        // 版本号和服务器相同, 则不需要从服务器上拉取数据, 直接同步数据到服务器
        that.syncLocalDataToServer(tempData);
      }
    });
  },

  /**
   * 将本地数据同步到服务器
   */
  syncLocalDataToServer: function(data) {
    var that = this;
    // 遍历所有的数据
    data.forEach(function(item, index, items) {
      app.globalData.hotapp.replaceOpenIdKey(item.key, function(newKey) {
        if (newKey) {
          item.key = newKey;
          // 如果还有数据没有同步过, 则调用post接口同步到服务器
          if (item.state == 1) {
            app.globalData.hotapp.post(item.key, item.value, function(res) {
              if (res.ret == 0) {
                // 同步成功后更新状态, 并存缓存
                item.state = 2;
                item = app.formatItem(item);
                that.setData({
                  items: items
                });
                wx.setStorageSync('items', items);
              }
            });
          }

          // 如果数据被删除过, 则调用delete接口从服务器删除数据
          if (item.state == 3) {
            app.globalData.hotapp.del(item.key, function(res) {
              if (res.ret == 0 || res.ret == 103) {
                // 服务器的数据删除成功后, 删除本地数据并更新缓存
                items.splice(index, 1);
                that.setData({
                  items: items
                });
                wx.setStorageSync('items', items);
              }
            });
          }
        } else {
          return;
        }
      })
    });
  },

  /**
   * 将服务器的数据同步到本地
   */
  syncServerDatatoLocal: function(localData, serverData) {
    var that = this;

    // 通过hash的性质去重, 服务器数据覆盖本地数据
    // 但是要保留本地中状态为已删除的数据
    // 删除的逻辑不在这里处理
    var localHash = new Array();
    localData.forEach(function(item) {
      localHash[item.key] = item;
    });

    var serverHash = new Array();
    serverData.forEach(function(item) {
      serverHash[item.key] = item;
    });

    // 先把服务器上有的数据但是本地没有的数据合并
    serverData.forEach(function(item) {
      var t = localHash[item.key];
      // 有新增的数据
      if (!t) {
        localHash[item.key] = item;
      }
      // 有相同的key则以服务器端为准
      if (t && t.state != 3) {
        item.state = 2;
        item = app.formatItem(item);
        localHash[item.key] = item;
      }
    });

    // 然后再删除本地同步过的但是服务器上没有的缓存数据(在其它设备上删除过了)
    localData.forEach(function(item, index, arr) {
      var t = serverHash[item.key];
      if (!t && item.state == 2) {
        console.log(item);
        delete localHash[item.key];
      }
    });

    // 将hash中的数据转换回数组
    var result = new Array();
    for (var prob in localHash) {
      result.push(localHash[prob]);
    }

    // 按时间排序
    result.sort(function(a, b) {
      return a.create_time < b.create_time;
    });

    console.log(result);
    return result;
  }
})
