<script setup>
import { ref, computed } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// --- 响应式状态定义 ---
const connected = ref(false);
const stompClient = ref(null);
const messages = ref([]); // 存储聊天消息的数组
const username = ref(''); // 用户名
const messageContent = ref(''); // 当前输入框中的消息内容

// 计算属性，用于判断连接按钮是否可用
const isConnectDisabled = computed(() => connected.value || !username.value.trim());

// --- WebSocket 方法 ---

function connect() {
  if (!username.value.trim()) {
    alert('Please enter your name first!');
    return;
  }

  // 使用相对路径，由代理（开发环境的 Vite 或生产环境的 nginx）处理转发
  const wsUrl = import.meta.env.VITE_APP_WEBSOCKET_URL;
  
  console.log('Connecting to WebSocket URL:', wsUrl);

  // 创建一个 STOMP 客户端实例
  stompClient.value = new Client({
    // 使用 SockJS 作为 WebSocket 的底层传输
    webSocketFactory: () => new SockJS(wsUrl),

    // 连接成功时的回调
    onConnect: (frame) => {
      connected.value = true;
      console.log('Connected: ' + frame);

      // 订阅公共聊天主题
      stompClient.value.subscribe('/topic/messages', (message) => {
        messages.value.push(JSON.parse(message.body));
      });
    },

    // 连接错误时的回调
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    },
  });

  // 激活客户端，开始连接
  stompClient.value.activate();
}

function disconnect() {
  if (stompClient.value) {
    stompClient.value.deactivate();
    connected.value = false;
    console.log("Disconnected");
  }
}

function sendMessage() {
  // 确保已连接、消息内容不为空
  if (stompClient.value && connected.value && messageContent.value.trim()) {
    const chatMessage = {
      from: username.value,
      text: messageContent.value,
    };

    // 发布（发送）消息到服务器的 /app/chat 目的地
    stompClient.value.publish({
      destination: '/app/chat',
      body: JSON.stringify(chatMessage),
    });

    // 清空输入框
    messageContent.value = '';
  }
}
</script>

<template>
  <div class="chat-container">
    <h1>Simple Chat Room (Vue 3 Migration)</h1>
    
    <div class="connection-controls">
      <input 
        type="text" 
        v-model="username" 
        placeholder="Enter your name to connect"
        :disabled="connected"
      />
      <button @click="connect" :disabled="isConnectDisabled">Connect</button>
      <button @click="disconnect" :disabled="!connected">Disconnect</button>
    </div>

    <div v-if="connected" class="conversation-area">
      <hr>
      <div class="message-window">
        <!-- 循环渲染消息列表 -->
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <b class="username">{{ msg.from }}:</b> {{ msg.text }}
        </div>
      </div>
      
      <div class="message-input">
        <input 
          type="text" 
          v-model="messageContent" 
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: sans-serif;
  background-color: #f9f9f9;
}

.connection-controls, .message-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input[type="text"] {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.conversation-area {
  margin-top: 20px;
}

.message-window {
  border: 1px solid #ddd;
  padding: 10px;
  height: 300px;
  overflow-y: scroll;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 4px;
}

.message {
  margin-bottom: 8px;
  line-height: 1.4;
}

.username {
  color: #0056b3;
  font-weight: bold;
}
</style>