package com.mocircle.cidrawing.view;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Canvas;
import android.os.Build;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;

import com.google.gson.Gson;
import com.mocircle.android.logging.CircleLog;
import com.mocircle.cidrawing.utils.SocketDrawingEvent;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

/**
 * A view to provide drawing features.
 */
public class CiDrawingView extends View implements DrawingView {

    protected DrawingViewProxy viewProxy;
    protected Socket socket;
    private Gson gson;

    public CiDrawingView(Context context) {
        super(context);
        setupView();
        socket.on("DRAWLINE", onSocketEvent());
    }

    public CiDrawingView(Context context, Socket socket) {
        super(context);
        setupView();
        this.gson = new Gson();
    }

    public CiDrawingView(Context context, AttributeSet attrs) {
        super(context, attrs);
        setupView();
        this.gson = new Gson();
    }

    public CiDrawingView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        setupView();
        this.gson = new Gson();
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public CiDrawingView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        setupView();
    }

    @Override
    public void setViewProxy(DrawingViewProxy viewProxy) {
        this.viewProxy = viewProxy;
    }

    @Override
    public void notifyViewUpdated() {
        invalidate();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (viewProxy != null) {
            if (viewProxy.onTouchEvent(event)) {
                return true;
            }
        }
        return super.onTouchEvent(event);
    }

    //    @Override
    public boolean onSocketEvent(SocketDrawingEvent event) {
        if (viewProxy != null) {
            if (viewProxy.onSocketEvent(event)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (viewProxy != null) {
            viewProxy.onDraw(canvas);
        }
    }

    protected void setupView() {
        setLayerType(LAYER_TYPE_HARDWARE, null);
    }

    public void setSocket(Socket socket) {
        this.socket = socket;
    }

    @NonNull
    private Emitter.Listener onSocketEvent() {
        return args -> CircleLog.i("SOCKET_DRAWLINE_CI_DRAWING_VIEW", "DRAWLINE EVNT FROM SOCKET");
    }

}
