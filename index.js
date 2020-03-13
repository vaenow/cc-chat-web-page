$(function() {
  // 初始化 vue
  var vmMessageList = new Vue({
    el: "#message-list",
    data: {
      messages: []
    }
  });
  var vmUserList = new Vue({
    el: "#user-list",
    data: {
      users: []
    }
  });

  const MSG_TYPE = {
    CONNECTED: "CONNECTED",
    LOGIN: "LOGIN",
    LIST: "LIST",
    JOIN: "JOIN",
    CHAT: "CHAT",
    TICK: "TICK",
  };

  // 启动 ws
  const bootWebSocket = ({ host, username, chatroom }) => {
    var ws = new WebSocket(host || "ws://127.0.0.1:3001");

    ws.onmessage = function(event) {
      var data = event.data;
      console.log(data);
      var msg = JSON.parse(data);
      if (msg.type === MSG_TYPE.LIST) {
        vmUserList.users = msg.data;
      } else if (msg.type === MSG_TYPE.LOGIN) {
        addToUserList(vmUserList.users, msg.user);
        addMessage(vmMessageList.messages, msg);
        keepAlive()
      } else if (msg.type === MSG_TYPE.CHAT) {
        addMessage(vmMessageList.messages, msg);
      } else if (msg.type === MSG_TYPE.CONNECTED) {
        userLogin();
      }
    };

    ws.onclose = function(evt) {
      console.log("[closed] " + evt.code);
      var input = $("#form-chat").find("input[type=text]");
      input.attr("placeholder", "WebSocket disconnected.");
      input.attr("disabled", "disabled");
      $("#form-chat")
        .find("button")
        .attr("disabled", "disabled");
    };

    ws.onerror = function(code, msg) {
      console.log("[ERROR] " + code + ": " + msg);
    };

    // 开始登录
    const userLogin = () => {
      // login
      ws.send(
        createMsg({
          type: MSG_TYPE.LOGIN,
          username,
          chatroom
        })
      );
    };

    // 保持登录
    const keepAlive = () => {
      setInterval(() => ws.send(
        createMsg({
          type: MSG_TYPE.TICK,
          username,
          chatroom
        })
      ), 1e3)
    }

    $("#form-chat").submit(function(e) {
      e.preventDefault();
      var input = $(this).find("input[type=text]");
      var text = input.val().trim();
      console.log("[chat] " + text);
      if (text) {
        input.val("");
        ws.send(
          createMsg({
            type: MSG_TYPE.CHAT,
            username,
            chatroom,
            content: text
          })
        );
      }
    });
  };

  // 消息协议
  const createMsg = ({ type, username, reciver, chatroom, content }) => {
    return JSON.stringify({ type, username, reciver, chatroom, content });
  };

  $("#form-login").submit(e => {
    e.preventDefault();
    const host = $(this)
      .find("input[name=host]")
      .val()
      .trim();
    const username = $(this)
      .find("input[name=username]")
      .val()
      .trim();
    const chatroom = $(this)
      .find("input[name=chatroom]")
      .val()
      .trim();

    if (host && username && chatroom) {
      $("#form-login button").addClass('disabled')
      bootWebSocket({ host, username, chatroom });
    } else {
      alert("登录消息不全");
    }
  });
});

function addToUserList(list, user) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === user.id) {
      return;
    }
  }
  list.push(user);
}

function removeFromUserList(list, user) {
  var i,
    target = -1;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === user.id) {
      target = i;
      break;
    }
  }
  if (target >= 0) {
    list.splice(target, 1);
  }
}

function addMessage(list, msg) {

  list.push(msg);
  $("#message-list")
    .parent()
    .animate(
      {
        scrollTop: $("#message-list").height()
      },
      200
    );
}
