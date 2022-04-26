package com.mocircle.cidrawing.mode.selection;

import android.graphics.Path;
import android.view.MotionEvent;

import com.mocircle.cidrawing.core.Vector2;
import com.mocircle.cidrawing.element.shape.ShapeElement;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public abstract class ShapeSelectionMode extends SelectionMode {

    private static final String TAG = "ShapeSelectionMode";

    public ShapeSelectionMode() {
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_MOVE:
                if (selectionElement instanceof ShapeElement) {
                    ((ShapeElement) selectionElement).setupElementByVector(new Vector2(downX, downY, event.getX(), event.getY()));
                }
                return true;
            default:
                return super.onTouchEvent(event);
        }
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        switch (event.type) {
            case SocketDrawingEventType.DRAW_SELECTION:
                if (selectionElement instanceof ShapeElement) {
                    ((ShapeElement) selectionElement).setupElementByVector(new Vector2(downX, downY, event.selectObj.getOff().getX(), event.selectObj.getOff().getY()));
                }
                return true;
            default:
                return super.onSocketEvent(event);
        }
    }

    @Override
    protected Path getSelectionPath() {
        if (selectionElement instanceof ShapeElement) {
            return ((ShapeElement) selectionElement).getElementPath();
        } else {
            return null;
        }
    }

}
