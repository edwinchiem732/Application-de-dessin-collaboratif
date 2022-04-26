package com.mocircle.cidrawing.mode.selection;


import android.graphics.Path;
import android.view.MotionEvent;

import com.google.gson.Gson;
import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.DrawingContext;
import com.mocircle.cidrawing.PaintBuilder;
import com.mocircle.cidrawing.board.ElementManager;
import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.VirtualElement;
import com.mocircle.cidrawing.mode.AbstractDrawingMode;
import com.mocircle.cidrawing.utils.DrawUtils;
import com.mocircle.cidrawing.utils.Point;
import com.mocircle.cidrawing.utils.SelectObj;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public abstract class SelectionMode extends AbstractDrawingMode {

    private static final String TAG = "SelectionMode";

    protected ElementManager elementManager;
    protected PaintBuilder paintBuilder;
    protected CiPaint selectionPaint;

    protected float downX;
    protected float downY;

    protected DrawElement selectionElement;
    private static String shapeId = "sss";
    protected VirtualElement virtualElement;
    protected DrawElement selectedElement;
    protected DrawingContext drawingContext;
    private Gson gson;

    public SelectionMode() {
        this.gson = new Gson();
    }

    @Override
    public void setDrawingBoardId(String boardId) {
        super.setDrawingBoardId(boardId);
        elementManager = drawingBoard.getElementManager();
        paintBuilder = drawingBoard.getPaintBuilder();
        selectionPaint = paintBuilder.createRectSelectionToolPaint();
        drawingContext = drawingBoard.getDrawingContext();
    }

    @Override
    public void onLeaveMode() {
        elementManager.clearSelection();
        drawingBoard.getDrawingView().notifyViewUpdated();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        CircleLog.i("__SELECT_TOUCH_EVENT", "EVENT");

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();

//                selectionElement = createSelectionElement();
//                selectionElement.setPaint(selectionPaint);
//                elementManager.addAdornmentToCurrentLayer(selectionElement);

                onActionDownTouchEvent(downX, downY);

                return true;
            case MotionEvent.ACTION_UP:
                elementManager.removeAdornmentFromCurrentLayer(selectionElement);
                elementManager.clearSelection();

                if (DrawUtils.isSingleTap(drawingBoard.getDrawingView().getContext(), downX, downY, event)) {

                    // Single selection
                    for (int i = elementManager.getCurrentObjects().length - 1; i >= 0; i--) {
                        DrawElement element = elementManager.getCurrentObjects()[i];
                        if (element.isSelectionEnabled()) {
                            if (element.hitTestForSelection(downX, downY)) {
                                // Only allow one element selected
                                element.setSelected(true);
                                break;
                            }
                        }
                    }

                } else {

                    // Multiple selection
                    List<DrawElement> selectedElements = new ArrayList<>();
                    for (int i = elementManager.getCurrentObjects().length - 1; i >= 0; i--) {
                        DrawElement element = elementManager.getCurrentObjects()[i];
                        element.setSelected(false);
                        if (element.isSelectionEnabled() && element.hitTestForSelection(getSelectionPath())) {
                            selectedElements.add(element);
                        }
                    }
                    if (selectedElements.size() == 1) {
                        // Multiple selection with single element
                        selectedElements.get(0).setSelected(true);
                    } else if (selectedElements.size() > 1) {
                        // Real multiple selection
                        virtualElement = new VirtualElement(selectedElements);
                        virtualElement.setSelected(true);
                        elementManager.addAdornmentToCurrentLayer(virtualElement);
                    }
                }

                return true;
            case MotionEvent.ACTION_CANCEL:
                elementManager.removeAdornmentFromCurrentLayer(selectionElement);
                return true;
        }
        return false;
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        CircleLog.i("SELECT_SOCKET_EVENT", event.selectObj.toString());

        switch (event.type) {
            case SocketDrawingEventType.START_SELECTION:
                downX = event.selectObj.getOff().getX();
                downY = event.selectObj.getOff().getY();

                selectionElement = createSelectionElement();
                CircleLog.i("SELECT_CREATE", event.selectObj.toString());
                selectionElement.setPaint(selectionPaint);
                elementManager.addAdornmentToCurrentLayer(selectionElement);

                selectedElement = (DrawElement) elementManager.getElementFromElementsMap(event.selectObj.getIdentif());
                if (selectedElement != null && selectedElement.isSelectionEnabled()) {
                    if (selectedElement.hitTestForSelection(downX, downY)) {
                        // Only allow one element selected
                        selectedElement.setSelected(true);
                        break;
                    }
                }
//
                elementManager.removeAdornmentFromCurrentLayer(selectionElement);
                elementManager.clearSelection();

                return true;

            case SocketDrawingEventType.DRAW_SELECTION:
                if (!event.selectObj.getInside()) {
                    elementManager.removeAdornmentFromCurrentLayer(selectionElement);
                    elementManager.clearSelection();
                    elementManager.removeElementFromCurrentLayer(selectionElement);
                }
                return true;

            case SocketDrawingEventType.DELETE_SELECTION:
                elementManager.removeAdornmentFromCurrentLayer(selectionElement);
                elementManager.clearSelection();
                elementManager.removeElementFromCurrentLayer(selectionElement);
                elementManager.removeElementFromCurrentLayer(selectedElement);


//                if (DrawUtils.isSingleTap(drawingBoard.getDrawingView().getContext(), downX, downY, event)) {

                // Single selection
//                    for (int i = elementManager.getCurrentObjects().length - 1; i >= 0; i--) {
//                        DrawElement element = elementManager.getCurrentObjects()[i];
//                        if (element.isSelectionEnabled()) {
//                            if (element.hitTestForSelection(downX, downY)) {
//                                // Only allow one element selected
//                                element.setSelected(true);
//                                break;
//                            }
//                        }
//                    }

//                } else {
//
//                    // Multiple selection
//                    List<DrawElement> selectedElements = new ArrayList<>();
//                    for (int i = elementManager.getCurrentObjects().length - 1; i >= 0; i--) {
//                        DrawElement element = elementManager.getCurrentObjects()[i];
//                        element.setSelected(false);
//                        if (element.isSelectionEnabled() && element.hitTestForSelection(getSelectionPath())) {
//                            selectedElements.add(element);
//                        }
//                    }
//                    if (selectedElements.size() == 1) {
//                        // Multiple selection with single element
//                        selectedElements.get(0).setSelected(true);
//                    } else if (selectedElements.size() > 1) {
//                        // Real multiple selection
//                        virtualElement = new VirtualElement(selectedElements);
//                        virtualElement.setSelected(true);
//                        elementManager.addAdornmentToCurrentLayer(virtualElement);
//                    }
//                }

                return true;
//            case MotionEvent.ACTION_CANCEL:
//                elementManager.removeAdornmentFromCurrentLayer(selectionElement);
//                return true;
        }
        return false;
    }

    protected void onActionDownTouchEvent(float x, float y) {
        SelectObj selectObj = new SelectObj(new Point((int) x, (int) y), elementManager.getShapeKey(selectedElement), true);
        drawingContext.socket.emit(SocketDrawingEventType.START_SELECTION, gson.toJson(selectObj));
    }

    protected void onActionMoveTouchEvent(float x, float y) {
//        drawingBoard.getDrawingContext().socket.emit(SocketDrawingEventType.DRAW_SELECTION, gson.toJson(pointData));
    }

    protected void onActionUpTouchEvent(float x, float y) {
//        drawingBoard.getDrawingContext().socket.emit(SocketDrawingEventType.END_SELECTION, gson.toJson(pencilObj));

        shapeId = UUID.randomUUID().toString();
    }

    protected abstract DrawElement createSelectionElement();

    protected abstract Path getSelectionPath();

}
