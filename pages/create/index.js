var app = getApp();
Page({
  data: {
    tags: [],
    tagCurrent: null,
    tag: '',
    ocrString: [],
    item: {
      key: "",
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
    focus: false,
    hiddenmodalput: true,
    tagValue: ''
  },

  toTotalk: function(event) {
    wx.navigateTo({
      url: "../totalk/totalk"
    })
  },

  clearData: function() {
    this.setData({
      ['item.value.title']: '',
      ['item.value.content']: '',
      ocrString: '',
      tagCurrent: null
    });
  },

  onChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: (response) => {
        response.tempFiles.map((file, index) => {
          const uploadTask = wx.uploadFile({
            url: 'https://tute.ferer.net/wxapp-tute-ocr',
            filePath: file.path,
            name: 'wxapp-tute-ocr-image',
            success: (response) => {
              var result = JSON.parse(response.data),
                string = ''
              console.log(result.orc_result.words_result);
              result.orc_result.words_result.forEach((item) => {
                string += item.words + '\n'
              })
              this.setData({
                ocrString: string
              })
            },
            error: (error) => {
              console.log(error);
            }
          })
        })
      }
    })
  },

  bindTopSwitch: function(event) {
    this.setData({
      tagCurrent: event.currentTarget.dataset.tagcurrent
    })
    this.createSelectorQuery()
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
    console.log(app.globalData.hotapp.getPrefix('tags') + (new Date()).getTime())
    this.setData({
      hiddenmodalput: true
    })
    app.globalData.hotapp.post('item_tags-JN5XfmK1EofAbSlL6F5NPnISo_' + (new Date()).getTime(), this.data.tagValue, function(res) {
      console.log(res)
    })
  },

  voteTitle: function(e) {
    this.data.tagValue = e.detail.value
  },

  modalinput: function() {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
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
   * 页面渲染事件
   */

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '新建'
    })
  },

  onShow: function() {
    app.getTags(items => {
      var tags = ['学习', '生活', '日常', '外语', '诗词']
      items.forEach(function(item, index, arr) {
        tags.push(item.value)
      })
      this.setData({
        tags
      })
    })

    app.globalData.hotapp.get('item_tags-JN5XfmK1EofAbSlL6F5NPnISo', function(res) {
      console.log(res)
    })
    var item = this.data.item;
    item.key = app.globalData.hotapp.genPrimaryKey('item');
    this.setData({
      item: item
    });

    this.clearData()
  },

  /**
   * 保存数据事件
   */
  onSubmit: function(event) {
    this.createSelectorQuery()
    var item = this.data.item;
    console.log(event)
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
    item.create_time = now;
    this.setData({
      item: item
    });
    app.store(this.data.item, res => {
      if (res) {
        console.log(res)
        this.clearData()
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
  }
});
