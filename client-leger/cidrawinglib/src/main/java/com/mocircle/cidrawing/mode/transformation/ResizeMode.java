package com.mocircle.cidrawing.mode.transformation;

import android.graphics.RectF;
import android.view.MotionEvent;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.element.behavior.ResizingDirection;
import com.mocircle.cidrawing.element.behavior.Selectable;
import com.mocircle.cidrawing.utils.Point;
import com.mocircle.cidrawing.utils.SelectObj;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;

public class ResizeMode extends DataTransformMode {

    private static final String TAG = "ResizeMode";

    private float downX;
    private float downY;

    private ResizingDirection direction;
    private boolean lockAspectRatio;

    public ResizeMode() {
    }

    public ResizeMode(boolean autoDetectMode) {
        super(autoDetectMode);
    }

    public ResizingDirection getResizingDirection() {
        return direction;
    }

    public void setResizingDirection(ResizingDirection direction) {
        this.direction = direction;
    }

    public boolean isLockAspectRatio() {
        return lockAspectRatio;
    }

    public void setLockAspectRatio(boolean lockAspectRatio) {
        this.lockAspectRatio = lockAspectRatio;
    }

    @Override
    public void onLeaveMode() {
        if (element != null) {
            element.setSelected(false);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        CircleLog.i("__RESIZE_MODE", "TOUCH_EVENT");
        boolean result = super.onTouchEvent(event);
        if (element == null || !element.isResizingEnabled()) {
            return result;
        }

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();

                SelectObj selectObj = new SelectObj(new Point((int) downX, (int) downY), elementManager.getShapeKey(element), (int) downX, (int) downY, false);
//                drawingContext.socket.emit(SocketDrawingEventType.RESIZE_SELECTION, (gson).toJson(selectObj));
                CircleLog.i("_EMIT_SIZE_SELECT", "EMIT_SIZE_SELECT");
                return true;
            case MotionEvent.ACTION_MOVE:
                resizeElement(downX, downY, event.getX(), event.getY());
                downX = event.getX();
                downY = event.getY();

                SelectObj selectObj1 = new SelectObj(new Point((int) downX, (int) downY), elementManager.getShapeKey(element), (int) downX, (int) downY, false);
//                drawingContext.socket.emit(SocketDrawingEventType.DRAW_SELECTION, (gson).toJson(selectObj1));
                CircleLog.i("_EMIT_DRAW_SELECT", "EMIT_SIZE_SELECT");

                return true;
        }
        return result;
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        CircleLog.i("__RESIZE_MODE_SOCKET_EVENT", event.type);

//        boolean result = super.onSocketEvent(event);
//        if (element == null || !element.isResizingEnabled()) {
//            return result;
//        }
//
//        switch (event.type) {
//            case SocketDrawingEventType.START_SELECTION:
//                downX = event.selectObj.getOff().getX();
//                downY = event.selectObj.getOff().getY();
//                return true;
//            case SocketDrawingEventType.RESIZE_SELECTION:
//                resizeElement(downX, downY, event.selectObj.getOff().getX(), event.selectObj.getOff().getY());
//                downX = event.selectObj.getOff().getX();
//                downY = event.selectObj.getOff().getY();
//                return true;
//        }
        return true;
    }

    @Override
    protected void detectElement(float x, float y) {
        super.detectElement(x, y);
        elementManager.clearSelection();
        if (element != null) {
            element.setSelected(true, Selectable.SelectionStyle.LIGHT);
            direction = ResizingDirection.CENTER;
        }
    }

    private void resizeElement(float x1, float y1, float x2, float y2) {
        float[] points = new float[4];
        element.getInvertedDisplayMatrix().mapPoints(points, new float[]{x1, y1, x2, y2});
        RectF box = element.getBoundingBox();

        float sx = 1;
        float sy = 1;
        float px = 0;
        float py = 0;
        switch (direction) {
            case CENTER:
                px = box.centerX();
                py = box.centerY();
                sx = (box.width() + (points[2] - points[0])) / box.width();
                sy = (box.height() + (points[3] - points[1])) / box.height();
                if (useSameAspectRatio()) {
                    sx = getUniformScale(sx, sy);
                    sy = getUniformScale(sx, sy);
                }
                break;
            case NORTH:
                px = box.right;
                py = box.bottom;
                sx = 1;
                sy = (box.height() + (points[1] - points[3])) / box.height();
                break;
            case SOUTH:
                px = box.left;
                py = box.top;
                sx = 1;
                sy = (box.height() + (points[3] - points[1])) / box.height();
                break;
            case WEST:
                px = box.right;
                py = box.bottom;
                sx = (box.width() + (points[0] - points[2])) / box.width();
                sy = 1;
                break;
            case EAST:
                px = box.left;
                py = box.top;
                sx = (box.width() + (points[2] - points[0])) / box.width();
                sy = 1;
                break;
            case NORTH_WEST:
                px = box.right;
                py = box.bottom;
                sx = (box.width() + (points[0] - points[2])) / box.width();
                sy = (box.height() + (points[1] - points[3])) / box.height();
                if (useSameAspectRatio()) {
                    sx = getUniformScale(sx, sy);
                    sy = getUniformScale(sx, sy);
                }
                break;
            case NORTH_EAST:
                px = box.left;
                py = box.bottom;
                sx = (box.width() + (points[2] - points[0])) / box.width();
                sy = (box.height() + (points[1] - points[3])) / box.height();
                if (useSameAspectRatio()) {
                    sx = getUniformScale(sx, sy);
                    sy = getUniformScale(sx, sy);
                }
                break;
            case SOUTH_WEST:
                px = box.right;
                py = box.top;
                sx = (box.width() + (points[0] - points[2])) / box.width();
                sy = (box.height() + (points[3] - points[1])) / box.height();
                if (useSameAspectRatio()) {
                    sx = getUniformScale(sx, sy);
                    sy = getUniformScale(sx, sy);
                }
                break;
            case SOUTH_EAST:
                px = box.left;
                py = box.top;
                sx = (box.width() + (points[2] - points[0])) / box.width();
                sy = (box.height() + (points[3] - points[1])) / box.height();
                if (useSameAspectRatio()) {
                    sx = getUniformScale(sx, sy);
                    sy = getUniformScale(sx, sy);
                }
                break;
        }

        // Do resizing
        if (sx > 0 && sy > 0) {
            element.resize(sx, sy, px, py);
            CircleLog.d(TAG, "Resize element by " + sx + ", " + sy);
        }
    }

    private boolean useSameAspectRatio() {
        return lockAspectRatio || element.isLockAspectRatio();
    }

    private float getUniformScale(float sx, float sy) {
        if (Math.abs(sx - 1) > Math.abs(sy - 1)) {
            return sx;
        } else {
            return sy;
        }
    }

}