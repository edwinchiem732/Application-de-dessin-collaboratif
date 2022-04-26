package com.mocircle.cidrawing.mode;

import android.os.Build;
import android.view.MotionEvent;

import androidx.annotation.RequiresApi;

import com.google.gson.Gson;
import com.mocircle.cidrawing.utils.DrawUtils;
import com.mocircle.cidrawing.utils.PencilObj;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public class BasePointMode extends AbstractDrawingMode {

    protected float downX;
    protected float downY;

    private Gson gson;
//    private String shapeId;

    @Override
    public void setDrawingBoardId(String boardId) {
        super.setDrawingBoardId(boardId);
        gson = new Gson();
//        shapeId = "aaa";
    }

//    public void setShapeId(String shapeId) {
//        this.shapeId = shapeId;
//    }

    // ----
    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        int x = 0, y = 0;
        if (event.pencilObj != null && event.pencilObj.getPointsList().length != 0) {
            x = event.pencilObj.getPointsList()[0].getX();
            y = event.pencilObj.getPointsList()[0].getY();
        } else if (event.point != null) {
            x = event.point.getX();
            y = event.point.getY();
        }

        switch (event.type) {
            case SocketDrawingEventType.START_LINE:
                downX = (float) x;
                downY = (float) y;
                onFirstPointDown(event.pencilObj, downX, downY);
                return true;
            case SocketDrawingEventType.DRAW_LINE:
                onOverPoint(event.id, event.user, ((float) event.point.getX()), ((float) event.point.getY()));
                downX = (float) x;
                downY = (float) y;
                return true;
            case SocketDrawingEventType.END_LINE:
//                boolean singleTap = DrawUtils.isSingleTap(drawingBoard.getDrawingView().getContext(), downX, downY, event);
                onLastPointUp(event.id, event.user, (float) x, (float) y, true);
                return true;
        }
        return false;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();
                onActionDownTouchEvent(downX, downY);
                return true;
            case MotionEvent.ACTION_MOVE:
                onActionMoveTouchEvent(event.getX(), event.getY());
                downX = event.getX();
                downY = event.getY();
                return true;
            case MotionEvent.ACTION_UP:
                boolean singleTap = DrawUtils.isSingleTap(drawingBoard.getDrawingView().getContext(), downX, downY, event);
                onActionUpTouchEvent(event.getX(), event.getY());
                return true;
            case MotionEvent.ACTION_CANCEL:
                onPointCancelled();
                return true;
        }
        return false;
    }

    protected void onActionDownTouchEvent(float x, float y) {

    }

    protected void onActionMoveTouchEvent(float x, float y) {
    }

    protected void onActionUpTouchEvent(float x, float y) {

    }

    protected void onFirstPointDown(PencilObj pencilObj, float x, float y) {
    }

    protected void onOverPoint(String id, String user, float x, float y) {
    }

    protected void onLastPointUp(String id, String user, float x, float y, boolean singleTap) {
    }

    protected void onPointCancelled() {
    }

}