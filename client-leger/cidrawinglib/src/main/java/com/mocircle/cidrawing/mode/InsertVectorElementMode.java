package com.mocircle.cidrawing.mode;

import static com.mocircle.cidrawing.utils.DrawUtils.intColorToRgbString;
import static com.mocircle.cidrawing.utils.DrawUtils.rgbStringToIntColor;

import android.annotation.SuppressLint;
import android.graphics.Paint;
import android.os.Build;
import android.view.MotionEvent;

import androidx.annotation.RequiresApi;

import com.google.gson.Gson;
import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.DrawingContext;
import com.mocircle.cidrawing.PaintBuilder;
import com.mocircle.cidrawing.board.ElementManager;
import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.core.Vector2;
import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.behavior.SupportVector;
import com.mocircle.cidrawing.element.shape.RectElement;
import com.mocircle.cidrawing.operation.InsertElementOperation;
import com.mocircle.cidrawing.operation.OperationManager;
import com.mocircle.cidrawing.utils.Point;
import com.mocircle.cidrawing.utils.PointData;
import com.mocircle.cidrawing.utils.ShapeObj;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;
import com.mocircle.cidrawing.utils.SupportedShapeType;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class InsertVectorElementMode extends AbstractDrawingMode {

    private static final String TAG = "InsertVectorElementMode";

    protected ElementManager elementManager;
    protected DrawingContext drawingContext;
    protected OperationManager operationManager;
    protected PaintBuilder paintBuilder;

    protected float downX;
    protected float downY;

    private static String shapeId = "bbb";

//    protected DrawElement previewElement;
//    protected DrawElement realElement;

    protected static Map<String, DrawElement> previewElements;
    protected static Map<String, DrawElement> realElements;
    protected static Map<String, Point> downPoints;
    protected static Map<String, ShapeObj> otherUsersShapes;
    private static String currentUserShapeType;

    private Gson gson;


    public InsertVectorElementMode() {
        this.gson = new Gson();
        this.previewElements = new HashMap<>();
        this.realElements = new HashMap<>();
        this.downPoints = new HashMap<>();
        this.otherUsersShapes = new HashMap<>();
        currentUserShapeType = SupportedShapeType.RECTANGLE;
    }

    @Override
    public void setDrawingBoardId(String boardId) {
        super.setDrawingBoardId(boardId);
        elementManager = drawingBoard.getElementManager();
        drawingContext = drawingBoard.getDrawingContext();
        operationManager = drawingBoard.getOperationManager();
        paintBuilder = drawingBoard.getPaintBuilder();
    }

    public static String getShapeId() {
        return shapeId;
    }

    public void setShapeId(String shapeId) {
        this.shapeId = shapeId;
    }

    public void setCurrentUserShapeType(String currentUserShapeType) {
        this.currentUserShapeType = currentUserShapeType;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                downX = event.getX();
                downY = event.getY();
                onActionDownTouchEvent(currentUserShapeType, event.getX(), event.getY());
                return true;
            case MotionEvent.ACTION_MOVE:
                onActionMoveTouchEvent(currentUserShapeType, event.getX(), event.getY());
                return true;
            case MotionEvent.ACTION_UP:
                onActionUpTouchEvent(currentUserShapeType, event.getX(), event.getY());
                return true;
            case MotionEvent.ACTION_CANCEL:
                return true;
        }
        return false;
    }

    @SuppressLint("NewApi")
    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        int x = 0, y = 0;
        if (event.shapeObj != null) {
            x = event.shapeObj.getX();
            y = event.shapeObj.getY();
        } else if (event.point != null) {
            x = event.point.getX();
            y = event.point.getY();
        }
        switch (event.type) {
            case SocketDrawingEventType.START_SHAPE:
                downX = x;
                downY = y;
                downPoints.put(event.id, new Point(event.shapeObj.getX(), event.shapeObj.getY()));
                otherUsersShapes.put(event.id, event.shapeObj);
                onFirstPointDown(event.shapeObj, event.drawingShapeType, (int) event.shapeObj.getX(), (int) event.shapeObj.getY());
                return true;
            case SocketDrawingEventType.DRAW_SHAPE:
                onOverPoint(event.id, event.user, event.point.getX(), event.point.getY());
                return true;
            case SocketDrawingEventType.END_SHAPE:
                onLastPointUp(event.shapeObj, event.drawingShapeType);
                return true;
        }
        return false;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected void onActionDownTouchEvent(String drawingShapeType, float x, float y) {
        CiPaint ciPaint = drawingBoard.getDrawingContext().getPaint();
        String stroke = intColorToRgbString(ciPaint.getColor());
        String fill = intColorToRgbString(ciPaint.getSecondaryColor());
        String strokeOpacity = "1";
        String fillOpacity = "1";
        int strokeWidth = (int) ciPaint.getStrokeWidth();

        ShapeObj shapeObj = new ShapeObj(shapeId, "abc", (int) downX, (int) downY, 0, 0, 0, 0, strokeWidth, fill, stroke, fillOpacity, strokeOpacity);
        if (drawingShapeType.equals(SupportedShapeType.RECTANGLE)) {
            drawingContext.socket.emit(SocketDrawingEventType.START_RECTANGLE, gson.toJson(shapeObj));
        } else if (drawingShapeType.equals(SupportedShapeType.ELLIPSE)) {
            drawingContext.socket.emit(SocketDrawingEventType.START_OVAL, gson.toJson(shapeObj));
        }
    }

    protected void onActionMoveTouchEvent(String drawingShapeType, float x, float y) {
        Point point = new Point((int) x, (int) y);
        PointData pointData = new PointData(shapeId, point);

        if (drawingShapeType.equals(SupportedShapeType.RECTANGLE)) {
            drawingContext.socket.emit(SocketDrawingEventType.DRAW_RECTANGLE, gson.toJson(pointData));
        } else if (drawingShapeType.equals(SupportedShapeType.ELLIPSE)) {
            drawingContext.socket.emit(SocketDrawingEventType.DRAW_OVAL, gson.toJson(pointData));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected void onActionUpTouchEvent(String drawingShapeType, float x, float y) {
        CiPaint ciPaint = drawingBoard.getDrawingContext().getPaint();
        String stroke = intColorToRgbString(ciPaint.getColor());
        String fill = intColorToRgbString(ciPaint.getSecondaryColor());
        String strokeOpacity = "1";
        String fillOpacity = "1";
        int strokeWidth = (int) ciPaint.getStrokeWidth();

        ShapeObj shapeObj = new ShapeObj(shapeId, "abc", (int) downX, (int) downY, (int) x, (int) y, (int) Math.abs(x - downX), (int) Math.abs(y - downY), strokeWidth, fill, stroke, fillOpacity, strokeOpacity);
        if (drawingShapeType.equals(SupportedShapeType.RECTANGLE)) {
            drawingContext.socket.emit(SocketDrawingEventType.END_RECTANGLE, gson.toJson(shapeObj));
        } else if (drawingShapeType.equals(SupportedShapeType.ELLIPSE)) {
            drawingContext.socket.emit(SocketDrawingEventType.END_OVAL, gson.toJson(shapeObj));
        }

        shapeId = UUID.randomUUID().toString();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected void onFirstPointDown(ShapeObj shapeObj, String drawingShapeType, int x, int y) {
        if (shapeObj.getUser().equals("abc")) {
            this.setShapeId(shapeObj.getId());
            this.setCurrentUserShapeType(drawingShapeType);
        }
        DrawElement previewElement = createPreviewElement(drawingShapeType, shapeObj);
        elementManager.addElementToCurrentLayer(previewElement);

        downPoints.put(shapeObj.getId(), new Point(shapeObj.getX(), shapeObj.getY()));
        otherUsersShapes.put(shapeObj.getId(), shapeObj);
        previewElements.put(shapeObj.getId(), previewElement);
    }

    protected void onOverPoint(String id, String user, int x, int y) {
        DrawElement previewElement = previewElements.get(id);
        Point downPoint = downPoints.get(id);
        if (previewElement != null && downPoint != null) {
//            ((SupportVector) previewElement).setupElementByVector(new Vector2(downX, downY, (float) x, (float) y));
            ((SupportVector) previewElement).setupElementByVector(new Vector2((float) downPoint.getX(), (float) downPoint.getY(), (float) x, (float) y));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected void onLastPointUp(ShapeObj shapeObj, String drawingShapeType) {
        DrawElement previewElement = previewElements.get(shapeObj.getId());
        Point downPoint = downPoints.get(shapeObj.getId());
        ShapeObj shapeObj1 = otherUsersShapes.get(shapeObj.getId());
        if (previewElement != null) {
            elementManager.removeElementFromCurrentLayer(previewElement);
            DrawElement element = createRealElement(shapeObj1, drawingShapeType, new Vector2(downPoint.getX(), downPoint.getY(), (float) shapeObj.getFinalX(), (float) shapeObj.getFinalY()));
            elementManager.addElementToElementsMap(shapeObj1.getId(), element);
            operationManager.executeOperation(new InsertElementOperation(element));
        }
    }

//    protected void setVectorElement(DrawElement realElement) {
//        this.realElement = realElement;
//        if (!(realElement instanceof SupportVector)) {
//            throw new IllegalArgumentException("Element must implement CreateByVector interface.");
//        }
//    }

    protected void setVectorElement(String id, DrawElement realElement) {
        realElements.put(id, realElement);
        if (!(realElement instanceof SupportVector)) {
            throw new IllegalArgumentException("Element must implement CreateByVector interface.");
        }
    }

//    protected DrawElement createPreviewElement() {
//        previewElement = new RectElement();
//        previewElement.setPaint(paintBuilder.createPreviewAreaPaint(drawingContext.getPaint()));
//        return previewElement;
//    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected DrawElement createPreviewElement(String drawingShapeType, ShapeObj shapeObj) {
        DrawElement previewElement = new RectElement();

        // stroke and fill properties
        CiPaint paint = new CiPaint(drawingContext.getPaint());
        applyShapePropertiesToPaint(shapeObj, paint);
//        previewElement.setPaint(paintBuilder.createPreviewAreaPaint(paint));
        previewElement.setPaint(paint);

        return previewElement;
    }

//    protected DrawElement createRealElement(Vector2 vector) {
//        DrawElement element = (DrawElement) realElement.clone();
//        element.setPaint(new CiPaint(drawingContext.getPaint()));
//        ((SupportVector) element).setupElementByVector(vector);
//        return element;
//    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected DrawElement createRealElement(ShapeObj shapeObj, String drawingShapeType, Vector2 vector) {
        DrawElement realElement = realElements.get(shapeObj.getId());
        CircleLog.i("REAL_ELEMENT", shapeObj.toString());
        DrawElement element = (DrawElement) realElement.clone();

        CiPaint paint = new CiPaint(drawingContext.getPaint());
        applyShapePropertiesToPaint(shapeObj, paint);

        element.setPaint(paint);
        ((SupportVector) element).setupElementByVector(vector);
        return element;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    protected void applyShapePropertiesToPaint(ShapeObj shapeObj, CiPaint paint) {
        paint.setStrokeWidth(shapeObj.getStrokeWidth());

        String fill = shapeObj.getFill();
        String stroke = shapeObj.getStroke();

        if (!fill.equals("none") && !stroke.equals("none")) {
            paint.setStyle(Paint.Style.FILL_AND_STROKE);
            paint.setColor(rgbStringToIntColor(stroke));
            paint.setSecondaryColor(rgbStringToIntColor(fill));
        }
    }


    @RequiresApi(api = Build.VERSION_CODES.O)
    public void drawSingleShape(ShapeObj shapeObj) {
        String shapeType = shapeObj.getType().equals("rectangle")
                ? SupportedShapeType.RECTANGLE
                : SupportedShapeType.ELLIPSE;
        onFirstPointDown(shapeObj, shapeType, shapeObj.getX(), shapeObj.getY());
        onLastPointUp(shapeObj, shapeType);
    }
}
