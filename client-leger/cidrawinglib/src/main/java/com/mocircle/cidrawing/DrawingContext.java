package com.mocircle.cidrawing;

import android.graphics.Paint;

import com.mocircle.cidrawing.core.CiPaint;
import com.mocircle.cidrawing.mode.DrawingMode;

import java.util.ArrayList;
import java.util.List;

import io.socket.client.Socket;

public class DrawingContext {

    private String boardId;
    private DrawingMode drawingMode;
    private List<DrawingModeChangedListener> drawingModeChangedListeners = new ArrayList<>();
    private CiPaint paint;

    public Socket socket;

    public DrawingContext(String boardId) {
        this.boardId = boardId;
        setupDefault();
    }

    public DrawingMode getDrawingMode() {
        return drawingMode;
    }

    public void setDrawingMode(DrawingMode drawingMode) {
        if (this.drawingMode != null) {
            this.drawingMode.onLeaveMode();
        }
        this.drawingMode = drawingMode;
        this.drawingMode.setDrawingBoardId(boardId);
        this.drawingMode.onEnterMode();

        // Notify drawing mode changed
        for (DrawingModeChangedListener listener : drawingModeChangedListeners) {
            listener.onDrawingModeChanged();
        }
    }

    public void addDrawingModeChangedListener(DrawingModeChangedListener listener) {
        drawingModeChangedListeners.add(listener);
    }

    public CiPaint getPaint() {
        if (paint == null) {
            paint = new CiPaint();
        }
        return paint;
    }

    private void setupDefault() {
        getPaint().setStyle(Paint.Style.STROKE);
    }

    public void setSocket(Socket socket) {
        this.socket = socket;
    }

    interface DrawingModeChangedListener {

        void onDrawingModeChanged();
    }

}
