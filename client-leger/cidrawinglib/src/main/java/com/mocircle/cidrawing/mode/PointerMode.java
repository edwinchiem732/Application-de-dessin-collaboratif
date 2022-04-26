package com.mocircle.cidrawing.mode;

import android.view.MotionEvent;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.board.ElementManager;
import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.behavior.ResizingDirection;
import com.mocircle.cidrawing.mode.selection.RectSelectionMode;
import com.mocircle.cidrawing.mode.selection.SelectionMode;
import com.mocircle.cidrawing.mode.transformation.MoveMode;
import com.mocircle.cidrawing.mode.transformation.ResizeMode;
import com.mocircle.cidrawing.mode.transformation.RotateMode;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public class PointerMode extends CompositeMode {

    private static final String TAG = "PointerMode";

    private static ElementManager elementManager;
    private static DrawingMode currentMode;

    private static SelectionMode selectionMode = new RectSelectionMode();
    //    private MoveReferencePointMode moveReferencePointMode = new MoveReferencePointMode();
    private static MoveMode moveMode = new MoveMode();
    private static RotateMode rotateMode = new RotateMode();
    private static ResizeMode resizeMode = new ResizeMode();

    public void setSelectionMode(SelectionMode selectionMode) {
        this.selectionMode = selectionMode;
    }

    @Override
    public void setDrawingBoardId(String boardId) {
        super.setDrawingBoardId(boardId);

        elementManager = drawingBoard.getElementManager();

        selectionMode.setDrawingBoardId(boardId);
//        moveReferencePointMode.setDrawingBoardId(boardId);
        moveMode.setDrawingBoardId(boardId);
        rotateMode.setDrawingBoardId(boardId);
        resizeMode.setDrawingBoardId(boardId);
    }

    @Override
    public void onLeaveMode() {
        if (currentMode != null) {
            currentMode.onLeaveMode();
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                // Auto switch mode
                hitTestForSwitchingMode(event.getX(), event.getY());

                currentMode.onTouchEvent(event);
                break;
            case MotionEvent.ACTION_MOVE:
                currentMode.onTouchEvent(event);
                break;
            case MotionEvent.ACTION_UP:
                currentMode.onTouchEvent(event);
                break;
            case MotionEvent.ACTION_CANCEL:
                currentMode.onTouchEvent(event);
                break;
        }
        return true;
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {

        switch (event.type) {
            case SocketDrawingEventType.START_SELECTION:
                // Auto switch mode
                CircleLog.i("_START_SELECT", event.selectObj.toString());
                hitTestForSwitchingMode(event.selectObj.getOff().getX(), event.selectObj.getOff().getY());

                currentMode.onSocketEvent(event);
                break;
            case SocketDrawingEventType.DRAW_SELECTION:
                CircleLog.i("_DRAW_SELECT", event.selectObj.toString());

                currentMode.onSocketEvent(event);
                break;
            case SocketDrawingEventType.RESIZE_SELECTION:
                currentMode.onSocketEvent(event);

            case SocketDrawingEventType.DELETE_SELECTION:
                currentMode = selectionMode;
                currentMode.onSocketEvent(event);
                break;
//                case MotionEvent.ACTION_CANCEL:
////                    currentMode.onTouchEvent(event);
//                    break;
        }
        return true;
    }


    private void hitTestForSwitchingMode(float x, float y) {
        for (int i = elementManager.getCurrentObjects().length - 1; i >= 0; i--) {
            DrawElement element = elementManager.getCurrentObjects()[i];
            if (element.isSelected()) {
//                CircleLog.i("__HIT___ELEEMNT_SELECTED", "ELEEMNT_SELECTED");
                ResizingDirection direction = element.hitTestForResizingHandle(x, y);
                if (direction != ResizingDirection.NONE) {
                    resizeMode.setElement(element);
                    resizeMode.setResizingDirection(direction);
                    currentMode = resizeMode;
                    CircleLog.i(TAG, "Switch to ResizeMode");
                    CircleLog.i("_HIT_RESIZE", direction.name());

                    return;
                }

                if (element.hitTestForSelection(x, y)) {
                    moveMode.setElement(element);
                    currentMode = moveMode;
                    CircleLog.i(TAG, "Switch to MoveMode");
                    return;
                }
            }
        }
        currentMode = selectionMode;
        CircleLog.i(TAG, "Switch to SelectionMode");
    }

}
