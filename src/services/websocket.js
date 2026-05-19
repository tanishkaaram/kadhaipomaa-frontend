import SockJS from "sockjs-client";

import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectSocket(roomId, onMessageReceived) {

  const socket = new SockJS("http://localhost:8088/chat");

  stompClient = new Client({

    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    onConnect: () => {

      stompClient.subscribe(

        `/topic/${roomId}`,

        (message) => {

          const parsed = JSON.parse(message.body);

          onMessageReceived(parsed);
        }
      );
    }
  });

  stompClient.activate();
}

export function sendMessage(message) {

  if (!stompClient) return;

  stompClient.publish({

    destination: "/app/message",

    body: JSON.stringify(message)
  });
}