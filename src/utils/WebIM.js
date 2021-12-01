console.log('+++-----', WebIM);
//初始化配置
let conn = {}
WebIM.config = config
conn = WebIM.conn = new WebIM.connection({
  appKey: WebIM.config.appkey,
  isHttpDNS: WebIM.config.isHttpDNS,
  isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
  https: WebIM.config.https,
  url: WebIM.config.socketServer,
  apiUrl: WebIM.config.restServer,
  isAutoLogin: WebIM.config.isAutoLogin,
  autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
  autoReconnectInterval: WebIM.config.autoReconnectInterval,
  delivery: WebIM.config.delivery,
  useOwnUploadFun: WebIM.config.useOwnUploadFun,
  deviceId: 'window_client'
})

//发送已读回执方法
function readAck(msg) {
  // console.log(msg);
  const {
    id,
    from
  } = msg;
  var msg = new WebIM.message('read', conn.getUniqueId());
  msg.set({
    id: id,
    to: from
  });
  conn.send(msg.body);
}
//添加监听回调



conn.listen({
  onOpened: function (message) {
    console.log('>>>>>>>登陆成功');
    vm.user_state = {
      text: '在线...',
      font_color: 'color:green;'
    }
    '在线...' //登陆成功修改在线状态
    // vm.user_state
  }, //连接成功回调 
  onClosed: function (message) {
    // alert('>>>>>退出环信');
    console.log(message)
    vm.user_state = {
      text: '离线中...',
      font_color: 'color:red;'
    } //登陆成功修改在线状态
  }, //连接关闭回调
  onTextMessage: function (message) {
    const {
      data
    } = message;
    readAck(message)
    notifyMe(data)
    console.log('>>>>>触发收到消息监听', message);
  }, //收到文本消息
  onEmojiMessage: function (message) {
    console.log('>>>>>>', message);
  }, //收到表情消息
  onPictureMessage: function (message) {
    console.log('>>>>>>收到图片消息', message);
  }, //收到图片消息
  onCmdMessage: function (message) {
    console.log('message', message)
  }, //收到命令消息
  onAudioMessage: function (message) {}, //收到音频消息
  onLocationMessage: function (message) {}, //收到位置消息
  onFileMessage: function (message) {
    console.log('>>>>>收到文件消息', message);
  }, //收到文件消息
  onVideoMessage: function (message) {
    console.log('>>>>>>收到视频消息', message);
    // var node = document.getElementById('privateVideo');
    // var option = {
    //     url: message.url,
    //     headers: {
    //       'Accept': 'audio/mp4'
    //     },
    //     onFileDownloadComplete: function (response) {
    //         var objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
    //         node.src = objectURL;
    //     },
    //     onFileDownloadError: function () {
    //         console.log('File down load error.')
    //     }
    // };
    // WebIM.utils.download.call(conn, option);
  }, //收到视频消息
  onContactInvited: function (msg) {
    console.log('>>>>收到好友邀请', msg);
  }, // 收到好友邀请
  onContactDeleted: function () {
    console.log('>被删除时回调此方法');
  }, // 被删除时回调此方法
  onContactAdded: function () {
    console.log('>>>>增加了联系人时回调此方法');
  }, // 增加了联系人时回调此方法
  onContactRefuse: function (msg) {
    console.log('>>>>好友请求被拒绝');
  }, // 好友请求被拒绝
  onContactAgreed: function (msg) {
    console.log('>>>好友请求被同意', msg);
  }, // 好友请求被同意
  onPresence: function (msg) {
    console.log('>>>>>>>>监听', msg);

  }, //处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
  onRoster: function (message) {}, //处理好友申请
  onInviteMessage: function (message) {
    console.log('onInviteMessage', message)
  }, //处理群组邀请
  onOnline: function () {
    console.log('>>>>网络连接')
  }, //本机网络连接成功
  onOffline: function () {
    console.log('>>>网络断开')
  }, //本机网络掉线
  onError: function (err) {
    console.log('>>>>onError', err);
  }, //失败回调
  onBlacklistUpdate: function (list) { //黑名单变动
    // 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
    console.log(list);
  },
  onRecallMessage: function (message) {
    console.log('>>>>>触发撤回消息回调', message);
  }, //收到撤回消息回调
  onReceivedMessage: function (message) {
    console.log('onReceivedMessage', message)
  }, //收到消息送达服务器回执
  onDeliveredMessage: function (message) {}, //收到消息送达客户端回执
  onReadMessage: function (message) {
    console.log('>>>>>>>触发已读回执', message);
  }, //收到消息已读回执
  onCreateGroup: function (message) {}, //创建群组成功回执（需调用createGroupNew）
  onMutedMessage: function (message) {
    console.log('onMutedMessage', message)
  }, //如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
  onChannelMessage: function (message) {
    console.log('>>>>>>>onChannelMessage', message);
  }, //收到整个会话已读的回执，在对方发送channel ack时会在这个回调里收到消息
  onCustomMessage: function (message) {
    console.log('>>>>>>>收到自定义消息', message);
  }, //收到自定义消息
});
//推送方法
function notifyMe(data) {
  Notification.requestPermission(status => {
    if (status === 'granted') {
      let notify = new Notification('新消息提示', {
        icon: './static/logo.png',
        body: data
      })

      // // 桌面消息显示时
      // notify.onshow = () => {
      //   let audio = new Audio('./mp3/test2.mp3');
      //   audio.play();
      // }

      // 点击时桌面消息时触发
      notify.onclick = () => {
        // 跳转到当前通知的tab,如果浏览器最小化，会将浏览器显示出来
        window.focus()
      }
    }
  })
}