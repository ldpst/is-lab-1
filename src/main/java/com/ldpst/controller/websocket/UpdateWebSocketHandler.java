package com.ldpst.controller.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UpdateWebSocketHandler extends TextWebSocketHandler {
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    public void broadcast(String event) {
        TextMessage message = new TextMessage("{\"event\":\"" + event.replace("\"", "") + "\"}");
        sessions.removeIf(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(message);
                    return false;
                }
            } catch (IOException ignored) {
            }
            return true;
        });
    }
}
