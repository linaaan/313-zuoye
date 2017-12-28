
var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    hideVerifyPhone: true,
    hideBindNewPhone: true,
    oldCode: '',
    oldCodeBtnDisabled: false,
    oldCodeStatus: '',
    nextStepDisabled: false,
    newPhone: '',
    newCode: '',
    newCodeBtnDisabled: false,
    newCodeStatus: '',
    bindNewPhoneBtnDisabled: false,
    codeInterval: 60
  },
  onLoad: function(){
    var userInfo = app.getUserInfo();

    if(userInfo.phone){
      this.setData({
        hideVerifyPhone: false
      })
    } else {
      this.setData({
        hideBindNewPhone: false
      })
    }
  },
  sendCodeToOldPhone: function(){
    var that = this;
    if(this.data.oldCodeBtnDisabled){
      return;
    }

    this.setData({
      oldCodeStatus: '',
      oldCodeBtnDisabled: true
    })
    app.sendRequest({
      url: '/index.php?r=AppData/PhoneCode',
      success: function(){
        var second = that.data.codeInterval,
            interval;

        interval = setInterval(function(){
          if(second < 0) {
            clearInterval(interval);
            that.setData({
              oldCodeStatus: '',
              oldCodeBtnDisabled: false
            })
          } else {
            that.setData({
              oldCodeStatus: second+'s',
            })
            second--;
          }
        }, 1000);
      },
      complete: function(){
        that.setData({
          oldCodeStatus: '',
          oldCodeBtnDisabled: false
        })
      }
    })

  },
  inputOldCode: function(e){
    this.setData({
      oldCode: e.detail.value
    })
  },
  nextStep: function(){
    var that = this;
    if(!this.data.oldCode){
      app.showModal({
        content: ''
      })
      return;
    }
    if(this.data.nextStepDisabled){
      return;
    }

    this.setData({
      nextStepDisabled: true
    })
    app.sendRequest({
      url: '/index.php?r=AppData/VerifyPhone',
      method: 'post',
      data: {
        code: this.data.oldCode
      },
      success: function(){
        that.setData({
          hideVerifyPhone: true,
          hideBindNewPhone: false
        })
      },
      complete: function(){
        that.setData({
          nextStepDisabled: false
        })
      }
    })
  },
  inputPhone: function(e){
    this.setData({
      newPhone: e.detail.value
    })
  },
  inputNewCode: function(e){
    this.setData({
      newCode: e.detail.value
    })
  },
  sendCodeToNewPhone: function(){
    var that = this,
        newPhone = this.data.newPhone;

    app.getStorage({
      key: 'session_key',
      success: function (res) {
        console.log(res);
        if (res.data == '' ) {
          app.showModal({
            content: ''
          })
          return;
        };
      }
    })

    if(!util.isPhoneNumber(newPhone)){
      app.showModal({
        content: ''
      })
      return;
    }
    if(this.data.newCodeBtnDisabled){
      return;
    }

    this.setData({
      newCodeStatus: '',
      newCodeBtnDisabled: true
    })
    app.sendRequest({
      url: '/index.php?r=AppData/NewPhoneCode',
      method: 'post',
      data: {
        phone: newPhone
      },
      success: function(res){
        var second = that.data.codeInterval,
            interval;

        interval = setInterval(function(){
          if(second < 0) {
            clearInterval(interval);
            that.setData({
              newCodeStatus: '',
              newCodeBtnDisabled: false
            })
          } else {
            that.setData({
              newCodeStatus: second+'s',
            })
            second--;
          }
        }, 1000);
      },
      complete: function(){
        that.setData({
          newCodeStatus: '',
          newCodeBtnDisabled: false
        })
      }
    })
  },
  bindNewPhone: function(){
    var that = this,
        newPhone = this.data.newPhone,
        newCode = this.data.newCode;

    if(!newPhone || !newCode){
      return;
    }
    if(!util.isPhoneNumber(newPhone)){
      app.showModal({
        content: ''
      })
      return;
    }

    if(this.data.bindNewPhoneBtnDisabled){
      return;
    }
    this.setData({
      bindNewPhoneBtnDisabled: true
    })

    app.sendRequest({
      url: '/index.php?r=AppData/XcxVerifyNewPhone',
      mehtod: 'post',
      data: {
        phone: newPhone,
        code: newCode
      },
      success: function(res){
        app.setUserInfoStorage({
          phone: newPhone
        });
        app.showToast({
          title: '',
          icon: 'success',
          success: function(){
            app.turnBack();
          }
        })
      },
      fail: function(res){
        app.showModal({
          content: ''+ res.data
        })
      },
      complete: function(){
        that.setData({
          bindNewPhoneBtnDisabled: false
        })
      }
    })
  },
  getPhoneNumber: function (e) {
    app.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppUser/GetPhoneNumber',
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success: function (res) {
        app.setUserInfoStorage({
          phone: res.data
        })
        app.showToast({
          title: '',
          icon: 'success',
          success: function(){
            setTimeout(function () {
              app.turnBack();
            }, 800);
          }
        })
      }
    })
  }

})
