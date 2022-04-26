package com.mocircle.cidrawing.mode;

import android.view.MotionEvent;

import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public class AutoDetectedElementOperationMode extends ElementOperationMode {

    protected boolean autoDetectMode;

    public AutoDetectedElementOperationMode() {
    }

    public AutoDetectedElementOperationMode(boolean autoDetectMode) {
        this.autoDetectMode = autoDetectMode;
    }

    public boolean isAutoDetectMode() {
        return autoDetectMode;
    }

    public void setAutoDetectMode(boolean autoDetectMode) {
        this.autoDetectMode = autoDetectMode;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                if (autoDetectMode) {
                    detectElement(event.getX(), event.getY());
                }
        }
        return super.onTouchEvent(event);
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        switch (event.type) {
            case SocketDrawingEventType.START_SELECTION:
                if (autoDetectMode) {
                    detectElement(event.selectObj.getOff().getX(), event.selectObj.getOff().getY());
                }
        }
        return super.onSocketEvent(event);
    }

    protected void detectElement(float x, float y) {
        setElement(elementManager.getFirstHitElement(x, y));
    }

}
