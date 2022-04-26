package com.mocircle.cidrawing.mode.transformation;

import android.graphics.Matrix;
import android.view.MotionEvent;

import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.mode.AutoDetectedElementOperationMode;
import com.mocircle.cidrawing.operation.DataTransformOperation;
import com.mocircle.cidrawing.utils.MatrixUtils;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;
import com.mocircle.cidrawing.utils.SocketDrawingEventType;

public abstract class DataTransformMode extends AutoDetectedElementOperationMode {

    protected Matrix originalDataMatrix;

    public DataTransformMode() {
    }

    public DataTransformMode(boolean autoDetectMode) {
        super(autoDetectMode);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
//        CircleLog.i("__RESIZE_MODE_DATA_TRANSFORM_MODE", "TOUCH_EVENT");

        boolean result = super.onTouchEvent(event);
        if (element == null) {
            return result;
        }
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
//                originalDataMatrix = new Matrix(element.getDataMatrix());
                return true;
            case MotionEvent.ACTION_UP:
//                Matrix deltaMatrix = MatrixUtils.getTransformationMatrix(originalDataMatrix, element.getDataMatrix());
//                resetTransformation(deltaMatrix);
//                operationManager.executeOperation(new DataTransformOperation(element, deltaMatrix));
                return true;
            case MotionEvent.ACTION_CANCEL:
//                deltaMatrix = MatrixUtils.getTransformationMatrix(originalDataMatrix, element.getDataMatrix());
//                resetTransformation(deltaMatrix);
                return true;
        }
        return result;
    }

    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        CircleLog.i("__RESIZE_MODE_DATA_TRANSFORM_SOCKET_EVENT", event.selectObj.toString());

        boolean result = super.onSocketEvent(event);
        if (element == null) {
            return result;
        }
        switch (event.type) {
            case SocketDrawingEventType.START_SELECTION:
                originalDataMatrix = new Matrix(element.getDataMatrix());
                return true;
            case SocketDrawingEventType.RESIZE_SELECTION:
                Matrix deltaMatrix = MatrixUtils.getTransformationMatrix(originalDataMatrix, element.getDataMatrix());
                resetTransformation(deltaMatrix);
                operationManager.executeOperation(new DataTransformOperation(element, deltaMatrix));
                return true;
//            case MotionEvent.ACTION_CANCEL:
//                deltaMatrix = MatrixUtils.getTransformationMatrix(originalDataMatrix, element.getDataMatrix());
//                resetTransformation(deltaMatrix);
//                return true;
        }
        return result;
    }

    protected void resetTransformation(Matrix deltaMatrix) {
        element.applyMatrixForData(MatrixUtils.getInvertMatrix(deltaMatrix));
        element.updateBoundingBox();
    }

}
