package com.ldpst.controller.websocket;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.*;

@Component
public class UpdateEventListener {
    private final UpdateWebSocketHandler handler;

    public UpdateEventListener(UpdateWebSocketHandler handler) {
        this.handler = handler;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void changed(DataChangedEvent event) {
        handler.broadcast(event.event());
    }
}
