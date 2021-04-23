const vm = new Vue({
    el: '#app',
    data() {
      return {
        isLogin: true, //true登陆 false注册

        user_state: {
          text: '离线中...',
          font_color: 'color:red;'
        },
        hxId: '', //环信ID
        hxPwd: '', //环信密码
        pickFileType: '', //选中的附件类型
        msgNum: "10", //漫游条数
        isSingle: true,
        recallType: '', //撤回类型,
        messageId: '', //消息mid
        sendTo: '', //目标ID（包含群组以及聊天室ID）
        textValue: '', //文本域的value
        nowChatType: 'singleChat', //选中聊天类型
        user_info: {
          nickname: '',
          avatarurl: '',
          mail: '',
          phone: '',
          gender: '',
          sign: '',
          birth: '',

        },
        freiendConfig: { //好友部分参数
          freiendId: ""
        },
        groupConfig: {
          groupId: '',
          id:"",
          addGroupLsit:[]
        }
      }
    },
    created() {

    },
    methods: {
      //登陆
      login() {
        let options = {
          apiUrl: WebIM.config.restServer,
          user: this.hxId,
          pwd: this.hxPwd,
          appKey: WebIM.config.appkey,
        }
        conn.open(options)
      },
      //token登陆
      loginToken() {
        var options = {
          user: this.hxId,
          accessToken: 'YWMt72qnlnpzEeuXoaGTylGr0-mnEluU3UYkp9fpuMJGksnXMPTwSkkR66nbLZyivJqzAwMAAAF37TS71gBPGgAwgkPIy74MMNO9DBCOcgVT4maetbrntUbrrFgrsB8Wvw',
          appKey: WebIM.config.appkey
        };
        conn.open(options);
      },
      //注册
      registerUser() {
        var options = {
          username: this.hxId,
          password: this.hxPwd,
          nickname: 'nickname', //改昵称并非存储在环信服务器的昵称主要用作APP端推送使用，web端暂未得到应用。
          appKey: WebIM.config.appkey,
          success: function () {
            alert('注册OK')
          },
          error: function (err) {
            let errorData = JSON.parse(err.data)
            if (errorData.error === 'duplicate_unique_property_exists') {
              alert('用户已存在！')
            } else if (errorData.error === 'illegal_argument') {
              if (errorData.error_description === 'USERNAME_TOO_LONG') {
                alert('用户名超过64个字节！')
              } else {
                alert('用户名不合法！')
              }
            } else if (errorData.error === 'unauthorized') {
              alert('注册失败，无权限！')
            } else if (errorData.error === 'resource_limited') {
              alert('您的App用户注册数量已达上限,请升级至企业版！')
            }
          },
        }
        conn.registerUser(options)
      },
      //登出
      exit() {
        conn.close();
        (this.hxId = ''), (this.hxPwd = '')
        // console.log(111);
      },
      //修改聊天模式
      setChatType(val) {
        console.log(val)
        let chatTpe = {
          0: 'singleChat',
          1: 'groupChat',
          2: 'chatRoom',
        }
        this.nowChatType = chatTpe[val]
      },
      isCheck(e) {
        console.log(this.$refs.isCheck.checked);
      },
      //文本消息
      sendTextMsg() {
        let id = conn.getUniqueId() // 生成本地消息id
        let msg = new WebIM.message('txt', id) // 创建文本消息
        msg.set({
          msg: this.textValue, // 消息内容
          to: String(this.sendTo), // 接收消息对象（用户id）
          chatType: this.nowChatType, // 设置聊天类型
          ext: {
            key: '头像URL',
            key2: {
              key3: '昵称',
            },
          }, //扩展消息
          success: function (id, serverMsgId) {
            console.log('>>>>>>>>发送成功', id, serverMsgId)
          },
          fail: function (e) {
            // 失败原因:
            // e.type === '603' 被禁言
            // e.type === '605' 群组不存在
            // e.type === '602' 不在群组或聊天室中
            // e.type === '504' 撤回消息时超出撤回时间
            // e.type === '505' 未开通消息撤回
            // e.type === '506' 没有在群组或聊天室白名单
            // e.type === '503' 未知错误
            console.log('Send private text error', e, msg.body)
          },
        })
        conn.send(msg.body)
      },
      //自定义消息
      sendCustomMsg() {
        var id = conn.getUniqueId() // 生成本地消息id
        var msg = new WebIM.message('custom', id) // 创建自定义消息
        var customEvent = 'EvenName' // 创建自定义事件
        var customExts = {
          ang: 'something',
        } // 消息内容，key/value 需要 string 类型
        msg.set({
          to: this.sendTo, // 接收消息对象（用户id）
          customEvent,
          customExts,
          chatType: this.nowChatType,
          ext: {}, // 消息扩展
          success: function (id, serverMsgId) {
            console.log('>>>>>>自定义消息发送成功', id, serverMsgId)
          },
          fail: function (e) {
            console.log('>>>>>消息发送失败', e)
          },
        })
        conn.send(msg.body)
      },
      //命令消息
      sendCmdMsg() {
        var id = conn.getUniqueId() //生成本地消息id
        var msg = new WebIM.message('cmd', id) //创建命令消息
        msg.set({
          to: this.hxId, //接收消息对象
          action: 'action', //用户自定义，cmd消息必填
          chatType: this.nowChatType,
          ext: {
            extmsg: 'extends messages'
          }, //用户自扩展的消息内容（群聊用法相同）
          success: function (id, serverMsgId) {
            console.log('>>>>>CMD消息发送成功', id, serverMsgId);
          }, //消息发送成功回调
          fail: function (e) {
            console.log('Fail', e) //如禁言、拉黑后发送消息会失败
          },
        })
        conn.send(msg.body)
      },
      //上传附件
      updatFilebtn() {
        var input = document.getElementById('updateFile'); // 选择图片的input
        var file = WebIM.utils.getFileUrl(input); // 将图片转化为二进制文件
        var options = {
          apiUrl: '//a1.easemob.com',
          appName: WebIM.conn.context.appName,
          orgName: WebIM.conn.context.orgName,
          accessToken: WebIM.conn.context.restTokenData,
          appKey: WebIM.conn.appKey,
          file: file,
          onFileUploadComplete: function (data) {
            //upload file success
            console.log('>>>>>>附件上传成功', data);
          },
          onFileUploadError: function (e) {
            //upload file error
            console.log('>>>>>>附件上传失败', e);
          }
        };
        WebIM.utils.uploadFile(options);
      },
      //发送已上传的附件
      sendUpdatFile() {
        var data = JSON.stringify({
          "target_type": "users",
          "target": ["pfh", "hfp2"],
          "from": "hfp",
          "msg": {
            "type": "img",
            "filename": "testimg.jpg",
            "secret": "JImHMIC5EeuopvfANpeFvugwnqejgQYz6nkHeW8Rz9tIsBXd",
            "url": "https://a1.easemob.com/easemob-demo/chatdemoui/chatfiles/24896020-80b9-11eb-8d04-091af2f16c9e",
            "size": {
              "width": 480,
              "height": 720
            }
          }
        });

        var config = {
          method: 'post',
          url: 'http://a1.easemob.com/easemob-demo/chatdemoui/messages',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer + 自己的token',
            'Cookie': 'SERVERID=56681d1884f2ae64101416d8d04206c6|1615282024|1615281902'
          },
          data: data
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });

      },
      //发送附件消息
      sendFileMsg() {
        var id = conn.getUniqueId(); // 生成本地消息id
        var msg = new WebIM.message(`${this.pickFileType}`, id); // 创建图片消息
        var input = document.getElementById('updateFile'); // 选择图片的input
        var file = WebIM.utils.getFileUrl(input); // 将图片转化为二进制文件
        var allowType = {
          'jpg': true,
          'gif': true,
          'png': true,
          'bmp': true
        };
        // if (file.filetype.toLowerCase() in allowType) {
        var option = {
          file: file,
          length: '3000', // 视频文件时，单位(ms)
          ext: {
            file_length: file.data.size // 文件大小
          },
          to: this.sendTo, // 接收消息对象
          chatType: this.nowChatType, // 设置为单聊
          onFileUploadError: function (e) { // 消息上传失败
            console.log('onFileUploadError', e);
          },
          onFileUploadComplete: function (res) { // 消息上传成功
            console.log('onFileUploadComplete', res);
            let downLoadUrl = `${res.uri}/${res.entities[0].uuid}`;
            console.log('>>>>服务器上传成功返回的地址', downLoadUrl);
          },
          success: function (id, mid) { // 消息发送成功
            console.log('》》》》》附件发送成功', id, mid);
            input.value = null

          },
          fail: function (e) {
            console.log("Fail", e); //如禁言、拉黑后发送消息会失败
          },
          flashUpload: WebIM.flashUpload
        };
        msg.set(option);
        conn.send(msg.body);
        // }
      },
      //撤回消息
      recallMsg() {
        /**
         * 发送撤回消息
         * @param {Object} option - 
         * @param {Object} option.mid -   回撤消息id
         * @param {Object} option.to -   消息的接收方
         * @param {Object} option.type -  chat(单聊) groupchat(群组) chatroom(聊天室)
         */
        let option = {
          mid: this.messageId,
          to: this.sendTo,
          type: this.recallType
        }
        WebIM.conn.recallMessage(option)
      },
      //消息漫游
      historyMsg() {
        /**
         * 获取对话历史消息
         * @param {Object} options
         * @param {String} options.queue   - 对方用户id（如果用户id内含有大写字母请改成小写字母）/群组id/聊天室id
         * @param {String} options.count   - 每次拉取条数
         * @param {Boolean} options.isGroup - 是否是群聊，默认为false
         * @param {Function} options.success
         * @param {Funciton} options.fail
         */
        var options = {
          queue: this.sendTo,
          isGroup: this.$refs.isCheck.checked, //选中是群组，否则是单聊
          count: Number(this.msgNum),
          success: function (res) {
            console.log('>>>>>消息漫游拉取成功', res) //获取拉取成功的历史消息
            res.forEach(items => {
              console.log(items);
            });
          },
          fail: function (err) {
            console.log('>>>>拉取失败', err)
          }
        }
        WebIM.conn.fetchHistoryMessages(options)
      },
      initHistioryMsg() {
        WebIM.conn.mr_cache = []
        alert('初始化成功~')
      },
      //会话列表
      conveList() {
        WebIM.conn.getSessionList().then((res) => {
          console.log(res.data)
        })
      },
      //初始化readNum
      initReadNum() {
        var msg = new WebIM.message('channel', conn.getUniqueId());
        if (!this.$refs.isCheck.checked) {
          msg.set({
            to: this.sendTo
          });
          conn.send(msg.body);
          alert('初始化单聊会话成功！')
        } else {
          // 如果是群聊
          msg.set({
            to: this.sendTo,
            chatType: 'groupChat'
          });
          alert('初始化群聊会话成功！')
          conn.send(msg.body);
        }
      },
      //发贴图
      sendPicture(e) {
        // 单聊贴图发送
        console.log('>>>>>111', e);

      },

      /* 用户属性相关 */
      //设置全部用户属性
      updateOwnUserInfo() {
        let options = {
          nickname: this.user_info.nickname,
          avatarurl: this.user_info.avatarurl,
          mail: this.user_info.mail,
          phone: this.user_info.phone,
          gender: this.user_info.gender,
          birth: this.user_info.birth,
          sign: this.user_info.sign,
          ext: {
            nationality: 'China'
          }
        }
        WebIM.conn.updateOwnUserInfo(options).then((res) => {
          console.log(res)
        })
      },
      //设置单个用户属性
      updataSingleUserInfo() {
        WebIM.conn.updateOwnUserInfo('nickname', '昵称').then((res) => {
          console.log(res)
        })
      },
      //获取用户属性
      fetchUserInfoById() {
        let userId = this.sendTo
        WebIM.conn.fetchUserInfoById(userId, ['nickname', 'phone']).then((res) => {
          console.log('>>>>>>获取用户属性成功！', res)
        })
      },
      //获取好友关系列表
      getFriendList() {
        conn.getRoster().then((res) => {
          console.log('获取好友关系列表>>>', res.data) // res.data > ['user1', 'user2']
        }).catch(err => {
          console.log('err', err);
        });
      },
      //添加好友
      addContact() {
        let message = '加个好友呗!';
        conn.addContact('username', message)
      },
      //删除好友
      removeContact() {
        conn.deleteContact('username');
      },

      /* 群组功能相关 */
      //添加群组成员
      addList(){
        let id  = this.groupConfig.id;
        this.groupConfig.addGroupLsit.push(id)
        this.groupConfig.id = ""
      },
      //创建群组
      createGroup() {
        let options = {
          data: {
            groupname: '群组创建测试', // 群组名
            desc: 'group description', // 群组描述
            members: this.groupConfig.addGroupLsit, // 用户名组成的数组
            public: true, // pub等于true时，创建为公开群
            approval: true, // approval为true，加群需审批，为false时加群无需审批
            inviteNeedConfirm: false // 邀请加群，被邀请人是否需要确认。true 为需要被邀请者同意才会进群
          },
          success(res) {
            console.log('>>>>>创建成功',res);
          },
          error(err) {
            console.log('>>>>>>创建失败',err);
          },
        };
        conn.createGroupNew(options).then((res) => {
          console.log(res)
        })
      },
      //邀请好友加入群
      inviteFriendJoin() {
        let option = {
          users: ['pfh'],
          groupId: '145193178300418'
        };
        conn.inviteToGroup(option).then((res) => {
          console.log(res)
        })
      }
    },

  })