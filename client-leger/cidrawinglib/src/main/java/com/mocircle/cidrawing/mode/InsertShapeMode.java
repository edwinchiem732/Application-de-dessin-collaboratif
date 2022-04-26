package com.mocircle.cidrawing.mode;

import android.os.Build;

import androidx.annotation.RequiresApi;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.core.Vector2;
import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.shape.OvalElement;
import com.mocircle.cidrawing.element.shape.RectElement;
import com.mocircle.cidrawing.element.shape.ShapeElement;
import com.mocircle.cidrawing.utils.ShapeObj;
import com.mocircle.cidrawing.utils.SupportedShapeType;

public class InsertShapeMode extends InsertVectorElementMode {

    private static final String TAG = "InsertShapeMode";

    private Class<? extends ShapeElement> shapeType;
    private ShapeElement shapeInstance;

    public InsertShapeMode() {
    }

    /**
     * Sets shape type, it has the lower priority then {@link #setShapeInstance(ShapeElement)},
     * which means if shape instance has been set, it will ignore shape type.
     *
     * @param shapeType shape type
     */
    public void setShapeType(Class<? extends ShapeElement> shapeType) {
        this.shapeType = shapeType;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected DrawElement createPreviewElement(String drawingShapeType, ShapeObj shapeObj) {
//        previewElement = getShapeInstance();
//        previewElement.setPaint(paintBuilder.createPreviewPaint(drawingContext.getPaint()));
//        return previewElement;
        if (drawingShapeType.equals(SupportedShapeType.RECTANGLE)) {
            this.setShapeType(RectElement.class);
        } else {
            this.setShapeType(OvalElement.class);
        }

        // stroke and fill properties
        CiPaint paint = new CiPaint(drawingContext.getPaint());
        applyShapePropertiesToPaint(shapeObj, paint);


        DrawElement previewElement = getShapeInstance();
//        previewElement.setPaint(paintBuilder.createPreviewPaint(paint));
        previewElement.setPaint(paint);
        return previewElement;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected DrawElement createRealElement(ShapeObj shapeObj, String drawingShapeType, Vector2 vector) {
        CircleLog.i("_REAL_ELEMENT", drawingShapeType);
        if (drawingShapeType.equals(SupportedShapeType.RECTANGLE)) {
            this.setShapeType(RectElement.class);
        } else {
            this.setShapeType(OvalElement.class);
        }

        ShapeElement element = getShapeInstance();

        // stroke and fill properties
        CiPaint paint = new CiPaint(drawingContext.getPaint());
        applyShapePropertiesToPaint(shapeObj, paint);

        element.setPaint(paint);

        element.setupElementByVector(vector);
        return element;
    }

    private ShapeElement getShapeInstance() {
        if (shapeInstance != null) {
            return (ShapeElement) shapeInstance.clone();
        } else if (shapeType != null) {
            try {
                return shapeType.newInstance();
            } catch (InstantiationException e) {
                throw new RuntimeException("Cannot create shape.", e);
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Cannot create shape.", e);
            }
        } else {
            throw new RuntimeException("Cannot find shape type or shape sample instance to create the new shape.");
        }
    }

    /**
     * Sets shape instance, it will create shape according to this sample instance. And it has the
     * higher priority then {@link #setShapeType(Class)}, which means if we set shape type and shape
     * instance, shape instance will take effect.
     *
     * @param shapeInstance shape instance
     */
    public void setShapeInstance(ShapeElement shapeInstance) {
        this.shapeInstance = shapeInstance;
    }

}
