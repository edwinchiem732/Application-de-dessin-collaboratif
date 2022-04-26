package com.mocircle.cidrawing.mode.transformation;

import android.view.MotionEvent;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.element.behavior.Selectable;
import com.mocircle.cidrawing.utils.Point;
import com.mocircle.cidrawing.utils.SelectObj;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public class MoveMode extends DisplayTransformMode {

    private static final String TAG = "MoveMode";

    private float downX;
    private float downY;

    public MoveMode() {
    }

    public MoveMode(boolean autoDetectMode) {
        super(autoDetectMode);
    }

    @Override
    public void onLeaveMode() {
        if (element != null) {
            element.setSelected(false);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (element == null || !element.isMovementEnabled()) {
            return result;
        }

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();

//                SelectObj selectObj = new SelectObj(new Point((int) event.getX(), (int) event.getX()), elementManager.getShapeKey(element), 0, 0, true);
//                drawingContext.socket.emit(SocketDrawingEventType.START_SELECTION, (gson).toJson(selectObj));

                return true;
            case MotionEvent.ACTION_MOVE:
                float offsetX = event.getX() - downX;
                float offsetY = event.getY() - downY;

//                element.move(offsetX, offsetY);

                downX = event.getX();
                downY = event.getY();

//                SelectObj selectObj1 = new SelectObj(new Point((int) event.getX(), (int) event.getY()), elementManager.getShapeKey(element), (int) event.getX(), (int) event.getY(), true);
                SelectObj selectObj1 = new SelectObj(new Point((int) offsetX, (int) offsetY), elementManager.getShapeKey(element), (int) offsetX, (int) offsetY, true);
                drawingContext.socket.emit(SocketDrawingEventType.DRAW_SELECTION, (gson).toJson(selectObj1));

                return true;
        }
        return result;
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        boolean result = super.onSocketEvent(event);
        if (element == null || !element.isMovementEnabled()) {
            return result;
        }

        switch (event.type) {
            case SocketDrawingEventType.START_SELECTION:
//                downX = event.selectObj.getOff().getX();
//                downY = event.selectObj.getOff().getY();
                return true;
            case SocketDrawingEventType.DRAW_SELECTION:
                float offsetX = event.selectObj.getOff().getX() - downX;
                float offsetY = event.selectObj.getOff().getY() - downY;

                element.move(event.selectObj.getX(), event.selectObj.getY());

                CircleLog.d(TAG, "Move element by " + offsetX + ", " + offsetY);
                CircleLog.v(TAG, "Element position: " + element.getLocX() + ", " + element.getLocY());
//                downX = event.selectObj.getOff().getX();
//                downY = event.selectObj.getOff().getY();
                return true;
        }
        return result;
    }

    @Override
    protected void detectElement(float x, float y) {
        super.detectElement(x, y);
        elementManager.clearSelection();
        if (element != null) {
            element.setSelected(true, Selectable.SelectionStyle.LIGHT);
        }
    }

}
