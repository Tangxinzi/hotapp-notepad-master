Page({

  data: {
    date: ["0000", "00", "00"],
    autoFocus: ''
  },

  onLoad: function(options) {
    wx.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f8f8f8',
    })

    wx.setNavigationBarTitle({
      title: '我的'
    })

    wx.login({
      success: function (res) {
        console.log(res);
      }
    })
  },

  getPhoneNumber: function(e) {
		console.log(e.detail.errMsg)
		console.log(e.detail.iv)
		console.log(e.detail.encryptedData)
	},

  bindDateChange: function(event) {
    this.setData({
      date: event.detail.value.split("-")
    })
  },

  autoFocus: function(event) {
    this.setData({
      autoFocus: event.target.dataset.value
    })
  },

  tapDone: function(event) {
    // wx.request({
    //   url: 'http://127.0.0.1:3333/api/users/1',
    //   method: 'PUT',
    //   data: {
    //     student_id: '02210141338'
    //   },
    //   success: response => {
    //     console.log(response);
    //   }
    // })
    console.log(event.target.dataset.value, event.detail.value)
  }
})
