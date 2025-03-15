document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const messageContainer = document.getElementById('message-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const usernameInput = document.getElementById('username');
  const typingIndicator = document.getElementById('typing-indicator');
  const roomList = document.getElementById('room-list');
  const currentRoomTitle = document.getElementById('current-room-title');
  const roomNameInput = document.getElementById('room-name');
  const roomDescriptionInput = document.getElementById('room-description');
  const createRoomButton = document.getElementById('create-room-button');

  // ユーザーIDはクライアント固有のIDを生成
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  let typingTimeout;
  let currentRoomId = null;
  
  // ルーム一覧を受信
  socket.on('room_list', (rooms) => {
    renderRoomList(rooms);
  });
  
  // ルームからのメッセージ履歴を受信
  socket.on('room_messages', (data) => {
    if (data.roomId === currentRoomId) {
      messageContainer.innerHTML = '';
      data.messages.forEach(addMessage);
      scrollToBottom();
    }
  });

  // 新しいメッセージ受信
  socket.on('new_message', (message) => {
    if (message.roomId === currentRoomId) {
      addMessage(message);
      scrollToBottom();
    }
  });
  
  // ユーザー参加通知
  socket.on('user_joined', (data) => {
    if (data.roomId === currentRoomId) {
      const notificationElement = document.createElement('div');
      notificationElement.classList.add('notification');
      notificationElement.textContent = `${data.username}さんが参加しました`;
      messageContainer.appendChild(notificationElement);
      scrollToBottom();
    }
  });
  
  // ユーザー退出通知
  socket.on('user_left', (data) => {
    if (data.roomId === currentRoomId) {
      const notificationElement = document.createElement('div');
      notificationElement.classList.add('notification');
      notificationElement.textContent = `${data.username}さんが退出しました`;
      messageContainer.appendChild(notificationElement);
      scrollToBottom();
    }
  });
  
  // 新しいルーム作成通知
  socket.on('new_room', (room) => {
    addRoomToList(room);
  });
  
  // タイピング通知
  socket.on('user_typing', (data) => {
    if (data.roomId === currentRoomId) {
      typingIndicator.textContent = `${data.username}さんが入力中...`;
      clearTimeout(typingTimeout);

      // 3秒後に通知を消す
      typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
      }, 3000);
    }
  });

  // エラー処理
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    alert('エラーが発生しました: ' + error.message);
  });
  
  // メッセージ送信ハンドラ
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else if (currentRoomId) {
      // タイピング通知を送信（ルームIDが選択されている場合のみ）
      socket.emit('typing', { 
        roomId: currentRoomId, 
        username: usernameInput.value.trim() || 'Anonymous' 
      });
    }
  });
  
  // ルーム作成ボタン
  createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    const roomDescription = roomDescriptionInput.value.trim();

    if (roomName) {
      socket.emit('create_room', {
        name: roomName,
        description: roomDescription
      });
      
      // 入力フィールドをクリア
      roomNameInput.value = '';
      roomDescriptionInput.value = '';
    } else {
      alert('ルーム名を入力してください');
    }
  });
  
  function sendMessage() {
    const content = messageInput.value.trim();
    const username = usernameInput.value.trim() || 'Anonymous';

    if (content && currentRoomId) {
      const messageData = {
        roomId: currentRoomId,
        userId: userId,
        username: username,
        content: content
      };
      
      socket.emit('send_message', messageData);
      messageInput.value = '';
    } else if (!currentRoomId) {
      alert('ルームを選択してください');
    }
  }
  
  function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.userId === userId ? 'own' : 'other');
    
    const usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.textContent = message.username;
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('content');
    contentElement.textContent = message.content;
    
    const timestampElement = document.createElement('div');
    timestampElement.classList.add('timestamp');
    const date = new Date(message.createdAt);
    timestampElement.textContent = date.toLocaleString();
    
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(contentElement);
    messageElement.appendChild(timestampElement);
    
    messageContainer.appendChild(messageElement);
  }
  
  function renderRoomList(rooms) {
    roomList.innerHTML = '';
    rooms.forEach(addRoomToList);
  }
  
  function addRoomToList(room) {
    const roomElement = document.createElement('div');
    roomElement.classList.add('room-item');
    roomElement.textContent = room.name;
    roomElement.dataset.roomId = room.id;
    
    // ルームの詳細情報をツールチップとして表示
    if (room.description) {
      roomElement.title = room.description;
    }
    
    roomElement.addEventListener('click', () => {
      // 以前のルームから退出
      if (currentRoomId) {
        socket.emit('leave_room', {
          roomId: currentRoomId,
          userId: userId,
          username: usernameInput.value.trim() || 'Anonymous'
        });
      }

      messageInput.disabled = false;
      sendButton.disabled = false;
      
      // 新しいルームに参加
      console.log(room)
      currentRoomId = room.id;
      currentRoomTitle.textContent = room.name;
      messageContainer.innerHTML = '';
      typingIndicator.textContent = '';
      
      socket.emit('join_room', {
        roomId: room.id,
        userId: userId,
        username: usernameInput.value.trim() || 'Anonymous'
      });
      
      // アクティブなルームをハイライト
      document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
      });
      roomElement.classList.add('active');
    });
    
    roomList.appendChild(roomElement);
  }
  
  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});