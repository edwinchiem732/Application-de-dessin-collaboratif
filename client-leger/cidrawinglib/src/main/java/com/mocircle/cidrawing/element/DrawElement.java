package com.mocircle.cidrawing.element;

import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Region;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.ConfigManager;
import com.mocircle.cidrawing.DrawingBoard;
import com.mocircle.cidrawing.DrawingBoardManager;
import com.mocircle.cidrawing.PaintBuilder;
import com.mocircle.cidrawing.PaintingBehavior;
import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.element.behavior.Movable;
import com.mocircle.cidrawing.element.behavior.Resizable;
import com.mocircle.cidrawing.element.behavior.ResizingDirection;
import com.mocircle.cidrawing.element.behavior.Rotatable;
import com.mocircle.cidrawing.element.behavior.Selectable;
import com.mocircle.cidrawing.element.behavior.Skewable;
import com.mocircle.cidrawing.exception.DrawingBoardNotFoundException;
import com.mocircle.cidrawing.persistence.ConvertUtils;
import com.mocircle.cidrawing.persistence.PersistenceException;
import com.mocircle.cidrawing.utils.DrawUtils;
import com.mocircle.cidrawing.utils.ShapeUtils;
import com.mocircle.cidrawing.view.DrawingView;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

/**
 * Basic element for drawing.
 */
public abstract class DrawElement extends BaseElement implements Selectable, Movable, Rotatable, Skewable, Resizable {

    private static final String TAG = "DrawElement";
    private static final String KEY_BOARD_ID = "boardId";
    private static final String KEY_PAINT = "paint";
    private static final String KEY_DISPLAY_MATRIX = "displayMatrix";
    private static final String KEY_DATA_MATRIX = "dataMatrix";
    private static final String KEY_BOUNDING_BOX = "boundingBox";
    private static final String KEY_REF_POINT = "refPoint";
    private static final String KEY_SELECTED = "selected";
    private static final String KEY_SELECTION_ENABLED = "selectionEnabled";
    private static final String KEY_SELECTION_STYLE = "selectionStyle";
    private static final String KEY_MOVEMENT_ENABLED = "movementEnabled";
    private static final String KEY_ROTATION_ENABLED = "rotationEnabled";
    private static final String KEY_SKEW_ENABLED = "skewEnabled";
    private static final String KEY_RESIZING_ENABLED = "resizingEnabled";
    private static final String KEY_LOCK_ASPECT_RATIO = "lockAspectRatio";
    private static final String KEY_ORDER_INDEX = "orderIndex";

    protected ConfigManager configManager;
    protected DrawingView drawingView;
    protected PaintBuilder paintBuilder;
    protected PaintingBehavior paintingBehavior;
    protected CiPaint debugPaintForLine;
    protected CiPaint debugPaintForArea;

    protected String boardId;
    protected CiPaint paint = new CiPaint();
    protected Matrix displayMatrix = new Matrix();
    protected Matrix dataMatrix = new Matrix();
    protected RectF boundingBox;
    protected PointF referencePoint;

    protected boolean selected;
    protected boolean selectionEnabled = true;
    protected SelectionStyle selectionStyle = SelectionStyle.FULL;
    protected boolean movementEnabled = true;
    protected boolean rotationEnabled = true;
    protected boolean skewEnabled = true;
    protected boolean resizingEnabled = true;
    protected boolean lockAspectRatio = false;
    protected int orderIndex = 0;

    public DrawElement() {
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
        DrawingBoard board = DrawingBoardManager.getInstance().findDrawingBoard(boardId);
        if (board == null) {
            throw new DrawingBoardNotFoundException();
        }
        configManager = board.getConfigManager();
        drawingView = board.getDrawingView();
        paintBuilder = board.getPaintBuilder();
        paintingBehavior = board.getPaintingBehavior();
        debugPaintForLine = paintBuilder.createDebugPaintForLine();
        debugPaintForArea = paintBuilder.createDebugPaintForArea();
    }

    public CiPaint getPaint() {
        return paint;
    }

    public void setPaint(CiPaint paint) {
        this.paint = paint;
    }

    public void drawToCanvas(Canvas canvas) {

        CircleLog.i("CANVAS_SIZE", "width " + String.valueOf(canvas.getWidth()) + "height " + String.valueOf(canvas.getHeight()));
        // Apply display matrix
        canvas.save();
        canvas.concat(getDisplayMatrix());

        // Draw element
        drawElement(canvas);

        // Draw selection
        if (isSelectionEnabled() && isSelected()) {
            drawSelection(canvas);
        }

        // Draw reference point
        if (isSelected() && hasReferencePoint()) {
            drawReferencePoint(canvas);
        }

        // Draw rotation handle
        if (isRotationEnabled() && isSelected() && getSelectionStyle() == SelectionStyle.FULL) {
            drawRotationHandle(canvas);
        }

        // Draw resizing handle
        if (isResizingEnabled() && isSelected() && getSelectionStyle() == SelectionStyle.FULL) {
            drawResizingHandle(canvas);
        }

        // Draw debug info for touchable area
        if (configManager.isDebugMode()) {
            canvas.drawPath(getTouchableArea(), debugPaintForArea);
        }

        canvas.restore();

        // Draw debug info for outer bounding box
        if (configManager.isDebugMode()) {
            canvas.drawRect(getOuterBoundingBox(), debugPaintForLine);
        }
    }

    public Matrix getDisplayMatrix() {
        return displayMatrix;
    }

    public Matrix getInvertedDisplayMatrix() {
        Matrix m = new Matrix();
        getDisplayMatrix().invert(m);
        return m;
    }

    public Matrix getDataMatrix() {
        return dataMatrix;
    }

    public void applyMatrixForData(Matrix matrix) {
        dataMatrix.postConcat(matrix);

        // Apply for reference point
        float[] points = new float[]{getReferencePoint().x, getReferencePoint().y};
        matrix.mapPoints(points);
        setReferencePoint(new PointF(points[0], points[1]));
    }

    /**
     * Transfer display matrix to data matrix, and reset the display matrix.
     */
    public Matrix applyDisplayMatrixToData() {
        Matrix matrix = new Matrix(getDisplayMatrix());
        applyMatrixForData(getDisplayMatrix());
        getDisplayMatrix().reset();
        updateBoundingBox();
        return matrix;
    }

    public void restoreDisplayMatrixFromData(Matrix matrix) {
        if (matrix != null) {
            Matrix invertDisplayMatrix = new Matrix();
            matrix.invert(invertDisplayMatrix);
            applyMatrixForData(invertDisplayMatrix);
            getDisplayMatrix().set(new Matrix(matrix));
            updateBoundingBox();
        }
    }

    public Path getTouchableArea() {
        Path path = new Path();
        if (getBoundingBox() != null) {
            path.addRect(getBoundingBox(), Path.Direction.CW);
        }
        return path;
    }

    public RectF getBoundingBox() {
        return boundingBox;
    }

    public void setBoundingBox(RectF boundingBox) {
        this.boundingBox = new RectF(boundingBox);
    }

    /**
     * Return the actual bounding box of the graphics without transformation
     *
     * @return
     */
    public RectF getOuterBoundingBox() {
        if (boundingBox != null) {
            Path path = new Path();
            path.addRect(boundingBox, Path.Direction.CW);
            path.transform(getDisplayMatrix());
            RectF box = new RectF();
            path.computeBounds(box, true);
            return box;
        }
        return new RectF();
    }

    public abstract void updateBoundingBox();

    public boolean hasReferencePoint() {
        return isRotationEnabled() || isSkewEnabled();
    }

    public PointF getReferencePoint() {
        if (referencePoint == null) {
            referencePoint = new PointF(getBoundingBox().centerX(), getBoundingBox().centerY());
        }
        return referencePoint;
    }

    public void setReferencePoint(PointF referencePoint) {
        this.referencePoint = referencePoint;
    }

    public PointF getActualReferencePoint() {
        float[] points = new float[2];
        getDisplayMatrix().mapPoints(points, new float[]{getReferencePoint().x, getReferencePoint().y});
        return new PointF(points[0], points[1]);
    }

    public void resetReferencePoint() {
        referencePoint = new PointF(getBoundingBox().centerX(), getBoundingBox().centerY());
    }

    public void drawReferencePoint(Canvas canvas) {
//        paintingBehavior.drawReferencePoint(canvas, getReferencePoint());
    }

    public boolean hitTestForReferencePoint(float x, float y) {
        if (!hasReferencePoint()) {
            return false;
        }
        RectF box = paintingBehavior.getPointBox(getReferencePoint());
        float[] points = new float[2];
        getInvertedDisplayMatrix().mapPoints(points, new float[]{x, y});
        return box.contains(points[0], points[1]);
    }

    public abstract void drawElement(Canvas canvas);

    @Override
    public JSONObject generateJson() {
        JSONObject object = super.generateJson();
        try {
            object.put(KEY_BOARD_ID, boardId);
            object.put(KEY_PAINT, paint.generateJson());
            object.put(KEY_DISPLAY_MATRIX, ConvertUtils.matrixToJson(displayMatrix));
            object.put(KEY_DATA_MATRIX, ConvertUtils.matrixToJson(dataMatrix));
            object.put(KEY_BOUNDING_BOX, ConvertUtils.rectToJson(boundingBox));
            object.put(KEY_REF_POINT, ConvertUtils.pointToJson(referencePoint));
            object.put(KEY_SELECTED, selected);
            object.put(KEY_SELECTION_ENABLED, selectionEnabled);
            object.put(KEY_SELECTION_STYLE, selectionStyle.name());
            object.put(KEY_MOVEMENT_ENABLED, movementEnabled);
            object.put(KEY_ROTATION_ENABLED, rotationEnabled);
            object.put(KEY_SKEW_ENABLED, skewEnabled);
            object.put(KEY_RESIZING_ENABLED, resizingEnabled);
            object.put(KEY_LOCK_ASPECT_RATIO, lockAspectRatio);
            object.put(KEY_ORDER_INDEX, orderIndex);
        } catch (JSONException e) {
            throw new PersistenceException(e);
        }
        return object;
    }

    @Override
    public void loadFromJson(JSONObject object, Map<String, byte[]> resources) {
        super.loadFromJson(object, resources);
        if (object != null) {
            try {
                setBoardId(object.getString(KEY_BOARD_ID));
                if (object.has(KEY_PAINT)) {
                    paint = new CiPaint();
                    paint.loadFromJson(object.getJSONObject(KEY_PAINT), resources);
                }
                displayMatrix = ConvertUtils.matrixFromJson(object.optJSONArray(KEY_DISPLAY_MATRIX));
                dataMatrix = ConvertUtils.matrixFromJson(object.optJSONArray(KEY_DATA_MATRIX));
                boundingBox = ConvertUtils.rectFromJson(object.optJSONArray(KEY_BOUNDING_BOX));
                referencePoint = ConvertUtils.pointFromJson(object.optJSONArray(KEY_REF_POINT));
                selected = object.optBoolean(KEY_SELECTED);
                selectionEnabled = object.optBoolean(KEY_SELECTION_ENABLED);
                selectionStyle = SelectionStyle.valueOf(object.optString(KEY_SELECTION_STYLE));
                movementEnabled = object.optBoolean(KEY_MOVEMENT_ENABLED);
                rotationEnabled = object.optBoolean(KEY_ROTATION_ENABLED);
                skewEnabled = object.optBoolean(KEY_SKEW_ENABLED);
                resizingEnabled = object.optBoolean(KEY_RESIZING_ENABLED);
                lockAspectRatio = object.optBoolean(KEY_LOCK_ASPECT_RATIO);
                orderIndex = object.optInt(KEY_ORDER_INDEX);
            } catch (JSONException e) {
                throw new PersistenceException(e);
            }
        }
    }

    @Override
    public void afterLoaded() {
        super.afterLoaded();
        updateBoundingBox();
    }

    @Override
    public boolean isSelectionEnabled() {
        return selectionEnabled && configManager.getDrawingType() == ConfigManager.DrawingType.Vector;
    }

    @Override
    public void setSelectionEnabled(boolean selectionEnabled) {
        this.selectionEnabled = selectionEnabled;
    }

    @Override
    public boolean isSelected() {
        return selected;
    }

    @Override
    public void setSelected(boolean selected) {
        setSelected(selected, SelectionStyle.FULL);
    }

    @Override
    public void setSelected(boolean selected, SelectionStyle selectionStyle) {
        this.selected = selected;
        this.selectionStyle = selectionStyle;
    }

    @Override
    public SelectionStyle getSelectionStyle() {
        return selectionStyle;
    }

    @Override
    public void drawSelection(Canvas canvas) {
        RectF box = getBoundingBox();
        paintingBehavior.drawSelection(canvas, box);
    }

    @Override
    public boolean hitTestForSelection(float x, float y) {
        if (!isSelectionEnabled()) {
            return false;
        }
        if (getBoundingBox() != null) {
            float[] points = new float[2];
            getInvertedDisplayMatrix().mapPoints(points, new float[]{x, y});

            Path path = getTouchableArea();
            RectF box = new RectF();
            if (path.isRect(box)) {
                // Quick check if path is rectangle
                return box.contains(points[0], points[1]);
            } else {
                Region region = ShapeUtils.createRegionFromPath(path);
                Rect touchSquare = DrawUtils.createTouchSquare(drawingView.getContext(), (int) points[0], (int) points[1]);
                if (region.quickReject(touchSquare)) {
                    // Quick check for not intersect case
                    return false;
                }
                Region pointRegion = new Region(touchSquare);
                return region.op(pointRegion, Region.Op.INTERSECT);
            }
        }
        return false;
    }

    @Override
    public boolean hitTestForSelection(Path path) {
        if (!isSelectionEnabled()) {
            return false;
        }

        RectF box = new RectF();
        if (path != null) {
            if (path.isRect(box)) {
                // Quick check if path is rectangle
                return box.contains(getOuterBoundingBox());
            } else {
                path.transform(getInvertedDisplayMatrix());
                Region r1 = ShapeUtils.createRegionFromPath(path);
                Region r2 = ShapeUtils.createRegionFromPath(getTouchableArea());
                if (r1.quickReject(r2)) {
                    // Quick check for not intersect case
                    return false;
                }
                return !r2.op(r1, Region.Op.DIFFERENCE);
            }
        }
        return false;
    }

    @Override
    public boolean isMovementEnabled() {
        return movementEnabled;
    }

    @Override
    public void setMovementEnabled(boolean movementEnabled) {
        this.movementEnabled = movementEnabled;
    }

    @Override
    public void move(float x, float y) {
        displayMatrix.postTranslate(x, y);
    }

    @Override
    public void moveTo(float locX, float locY) {
        move(locX - getLocX(), locY - getLocY());
    }

    @Override
    public float getLocX() {
        return getOuterBoundingBox().left;
    }

    @Override
    public float getLocY() {
        return getOuterBoundingBox().top;
    }

    @Override
    public boolean isRotationEnabled() {
        return rotationEnabled;
    }

    @Override
    public void setRotationEnabled(boolean rotationEnabled) {
        this.rotationEnabled = rotationEnabled;
    }

    @Override
    public void rotate(float degree, float px, float py) {
        getDisplayMatrix().postRotate(degree, px, py);
    }

    @Override
    public void drawRotationHandle(Canvas canvas) {
//        paintingBehavior.drawRotationHandle(canvas, getBoundingBox());
    }

    @Override
    public boolean hitTestForRotationHandle(float x, float y) {
        if (!isRotationEnabled()) {
            return false;
        }
        float[] points = new float[2];
        getInvertedDisplayMatrix().mapPoints(points, new float[]{x, y});
        RectF box = paintingBehavior.getRotationHandleBox(boundingBox);
        return box.contains(points[0], points[1]);
    }

    @Override
    public boolean isSkewEnabled() {
        return skewEnabled;
    }

    @Override
    public void setSkewEnabled(boolean skewEnabled) {
        this.skewEnabled = skewEnabled;
    }

    @Override
    public void skew(float kx, float ky, float px, float py) {
        Matrix m = new Matrix();
        m.postSkew(kx, ky, px, py);
        applyMatrixForData(m);
        updateBoundingBox();
    }

    @Override
    public boolean isResizingEnabled() {
        return resizingEnabled;
    }

    @Override
    public void setResizingEnabled(boolean enabled) {
        this.resizingEnabled = enabled;
    }

    @Override
    public boolean isLockAspectRatio() {
        return lockAspectRatio;
    }

    @Override
    public void setLockAspectRatio(boolean lockAspectRatio) {
        this.lockAspectRatio = lockAspectRatio;
    }

    @Override
    public void resetAspectRatio(AspectRatioResetMethod method) {
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    @Override
    public void resize(float sx, float sy, float px, float py) {
        Matrix m = new Matrix();
        m.postScale(sx, sy, px, py);
        applyMatrixForData(m);
        updateBoundingBox();
    }

    @Override
    public void resizeTo(float width, float height, float px, float py) {
        resize(width / boundingBox.width(), height / boundingBox.height(), px, py);
    }

    @Override
    public void drawResizingHandle(Canvas canvas) {
        paintingBehavior.drawResizingHandle(canvas, getBoundingBox(), !isLockAspectRatio());
    }

    @Override
    public ResizingDirection hitTestForResizingHandle(float x, float y) {
        if (!isResizingEnabled()) {
            return ResizingDirection.NONE;
        }

        float[] points = new float[2];
        getInvertedDisplayMatrix().mapPoints(points, new float[]{x, y});

        RectF box;

        // If element aspect ratio has been locked, we don't handle N,S,W,E handles.
        if (!isLockAspectRatio()) {
            box = paintingBehavior.getNResizingHandleBox(boundingBox);
            if (box.contains(points[0], points[1])) {
                return ResizingDirection.NORTH;
            }

            box = paintingBehavior.getSResizingHandleBox(boundingBox);
            if (box.contains(points[0], points[1])) {
                return ResizingDirection.SOUTH;
            }

            box = paintingBehavior.getWResizingHandleBox(boundingBox);
            if (box.contains(points[0], points[1])) {
                return ResizingDirection.WEST;
            }

            box = paintingBehavior.getEResizingHandleBox(boundingBox);
            if (box.contains(points[0], points[1])) {
                return ResizingDirection.EAST;
            }
        }

        box = paintingBehavior.getNWResizingHandleBox(boundingBox);
        if (box.contains(points[0], points[1])) {
            return ResizingDirection.NORTH_WEST;
        }

        box = paintingBehavior.getNEResizingHandleBox(boundingBox);
        if (box.contains(points[0], points[1])) {
            return ResizingDirection.NORTH_EAST;
        }

        box = paintingBehavior.getSWResizingHandleBox(boundingBox);
        if (box.contains(points[0], points[1])) {
            return ResizingDirection.SOUTH_WEST;
        }

        box = paintingBehavior.getSEResizingHandleBox(boundingBox);
        if (box.contains(points[0], points[1])) {
            return ResizingDirection.SOUTH_EAST;
        }

        return ResizingDirection.NONE;
    }

    @Override
    protected void cloneTo(BaseElement element) {
        super.cloneTo(element);
        if (element instanceof DrawElement) {
            DrawElement obj = (DrawElement) element;
            obj.boardId = boardId;
            obj.configManager = configManager;
            obj.paintBuilder = paintBuilder;
            obj.paintingBehavior = paintingBehavior;
            if (paint != null) {
                obj.paint = new CiPaint(paint);
            }
            obj.debugPaintForLine = debugPaintForLine;
            obj.debugPaintForArea = debugPaintForArea;

            if (displayMatrix != null) {
                obj.displayMatrix = new Matrix(displayMatrix);
            }
            if (dataMatrix != null) {
                obj.dataMatrix = new Matrix(dataMatrix);
            }
            if (boundingBox != null) {
                obj.boundingBox = new RectF(boundingBox);
            }
            if (referencePoint != null) {
                obj.referencePoint = new PointF(referencePoint.x, referencePoint.y);
            }

            obj.selected = selected;
            obj.selectionEnabled = selectionEnabled;
            obj.selectionStyle = selectionStyle;
            obj.movementEnabled = movementEnabled;
            obj.rotationEnabled = rotationEnabled;
            obj.skewEnabled = skewEnabled;
            obj.resizingEnabled = resizingEnabled;
            obj.lockAspectRatio = lockAspectRatio;
        }
    }
}



