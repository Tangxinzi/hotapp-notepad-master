var app = getApp();
Page({
  data: {
    content: ""
  },
  onSubmit: function(event) {
    if (!event.detail.value.content) {
        wx.showToast({
            title: "请填写反馈内容"
        });
        return;
    }

    var that = this;
    this.setData({
        content: event.detail.value.content
    })
    var now = Date.parse(new Date());
    var key = app.globalData.hotapp.getPrefix('feedback');
    app.globalData.hotapp.post(key, this.data.content, function(res) {
        if (res.ret == 0) {
            wx.showToast({
                title: "提交成功"
            });
            wx.redirectTo({
                url: "../index/index"
            })
        } else {
            wx.showToast({
                title: "提交失败"
            });
        }
    });
  }
})
