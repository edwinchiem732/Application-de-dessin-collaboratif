package com.mocircle.cidrawing.mode.stroke;

import static com.mocircle.cidrawing.utils.DrawUtils.intColorToRgbString;
import static com.mocircle.cidrawing.utils.DrawUtils.rgbStringToIntColor;

import android.graphics.PointF;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.google.gson.Gson;
import com.mocircle.cidrawing.DrawingContext;
import com.mocircle.cidrawing.board.ElementManager;
import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.element.StrokeElement;
import com.mocircle.cidrawing.mode.BasePointMode;
import com.mocircle.cidrawing.operation.InsertElementOperation;
import com.mocircle.cidrawing.operation.OperationManager;
import com.mocircle.cidrawing.utils.PencilObj;
import com.mocircle.cidrawing.utils.Point;
import com.mocircle.cidrawing.utils.PointData;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public abstract class BaseStrokeMode extends BasePointMode {

    protected ElementManager elementManager;
    protected OperationManager operationManager;
    protected DrawingContext drawingContext;

    private static String shapeId = "aaa";
    //    protected StrokeElement element;
    protected boolean immutable;
    protected static Map<String, StrokeElement> elements;

    private Gson gson;
    protected Map<String, Boolean> immutables;


    public BaseStrokeMode() {
        this.gson = new Gson();
        this.elements = new HashMap<>();
        immutables = new HashMap<>();
    }

    public String getShapeId() {
        return shapeId;
    }

    public void setShapeId(String shapeId) {
        this.shapeId = shapeId;
    }

    public boolean getStrokeImmutable() {
        return immutable;
    }

    public void setStrokeImmutable(boolean immutable) {
        this.immutable = immutable;
//        if (element != null) {
//            element.setSelectionEnabled(!immutable);
//        }
    }

    @Override
    public void setDrawingBoardId(String boardId) {
        super.setDrawingBoardId(boardId);
        elementManager = drawingBoard.getElementManager();
        operationManager = drawingBoard.getOperationManager();
        drawingContext = drawingBoard.getDrawingContext();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void onActionDownTouchEvent(float x, float y) {
        CiPaint ciPaint = drawingBoard.getDrawingContext().getPaint();
        String stroke = intColorToRgbString(ciPaint.getColor());
        String strokeOpacity = String.valueOf(ciPaint.getAlpha());
        int strokeWidth = (int) ciPaint.getStrokeWidth();

        Point point = new Point((int) x, (int) y);
        PencilObj pencilObj = new PencilObj(this.getShapeId(), "abc", new Point[]{point}, strokeWidth, "none", stroke, "none", strokeOpacity);
        drawingBoard.getDrawingContext().socket.emit(SocketDrawingEventType.START_LINE, gson.toJson(pencilObj));
    }

    @Override
    protected void onActionMoveTouchEvent(float x, float y) {
        PointData pointData = new PointData(this.getShapeId(), new Point((int) x, (int) y));
        drawingBoard.getDrawingContext().socket.emit(SocketDrawingEventType.DRAW_LINE, gson.toJson(pointData));
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void onActionUpTouchEvent(float x, float y) {
        CiPaint ciPaint = drawingBoard.getDrawingContext().getPaint();
        String stroke = intColorToRgbString(ciPaint.getColor());
        String strokeOpacity = String.valueOf(ciPaint.getAlpha());
        int strokeWidth = (int) ciPaint.getStrokeWidth();

        Point point = new Point((int) x, (int) y);

        ArrayList<Point> pointArrayList = new ArrayList<Point>();

        StrokeElement currentUserElement = elements.get(shapeId);
        if (currentUserElement != null) {
            for (PointF pointF : currentUserElement.getPoints()) {
                pointArrayList.add(new Point((int) pointF.x, (int) pointF.y));
            }
        }
        Point[] pointList = pointArrayList.toArray(new Point[0]);
//        PencilObj pencilObj = new PencilObj(this.getShapeId(), "abc", new Point[]{point}, strokeWidth, "none", stroke, "none", strokeOpacity);
        PencilObj pencilObj = new PencilObj(this.getShapeId(), "abc", pointList, strokeWidth, "none", stroke, "none", strokeOpacity);

        drawingBoard.getDrawingContext().socket.emit(SocketDrawingEventType.END_LINE, gson.toJson(pencilObj));

        shapeId = UUID.randomUUID().toString();

    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void onFirstPointDown(PencilObj pencilObj, float x, float y) {
        if (pencilObj.getUser().equals("abc")) {
            this.setShapeId(pencilObj.getId());
        }
        StrokeElement element = new StrokeElement();
        element.setSelectionEnabled(!immutable);

        // stroke properties
        CiPaint paint = assignPaint();
        paint.setStrokeWidth(pencilObj.getStrokeWidth());
        paint.setAlpha((int) (255 * Float.parseFloat(pencilObj.getStrokeOpacity())));

        if (!pencilObj.getStroke().equals("none")) {
            paint.setColor(rgbStringToIntColor(pencilObj.getStroke()));
        }
        element.setPaint(paint);

        elementManager.addElementToCurrentLayer(element);
        element.addPoint(x, y);

        elements.put(pencilObj.getId(), element);
    }

    @Override
    protected void onOverPoint(String id, String user, float x, float y) {
        StrokeElement element = elements.get(id);
        if (element != null) {
            element.addPoint(x, y);
        }
    }

    @Override
    protected void onLastPointUp(String id, String user, float x, float y, boolean singleTap) {
        StrokeElement element = elements.get(id);
        if (element != null) {
            element.addPoint(x, y);
            element.doneEditing();
            elementManager.removeElementFromCurrentLayer(element);
            operationManager.executeOperation(new InsertElementOperation(element));
        }
    }

    @Override
    protected void onPointCancelled() {
//        elementManager.removeElementFromCurrentLayer(element);
    }


    @RequiresApi(api = Build.VERSION_CODES.O)
    public void drawSingleLine(PencilObj pencilObj) {
        int nbPoints = pencilObj.getPointsList().length;
        onFirstPointDown(pencilObj, (float) pencilObj.getPointsList()[0].getX(), (float) pencilObj.getPointsList()[0].getY());
        for (int j = 1; j < nbPoints - 2; j++) {
            onOverPoint(pencilObj.getId(), pencilObj.getUser(), (float) pencilObj.getPointsList()[j].getX(), (float) pencilObj.getPointsList()[j].getY());
        }
        onLastPointUp(pencilObj.getId(), pencilObj.getUser(), (float) pencilObj.getPointsList()[nbPoints - 1].getX(), (float) pencilObj.getPointsList()[nbPoints - 1].getY(), true);
    }

    protected abstract CiPaint assignPaint();

}
