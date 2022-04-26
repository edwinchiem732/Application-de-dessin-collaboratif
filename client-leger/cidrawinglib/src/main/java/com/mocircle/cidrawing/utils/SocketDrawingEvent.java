package com.mocircle.cidrawing.utils;

public class SocketDrawingEvent {
    public String id;
    public Point point;
    public String type;
    public String drawingShapeType;
    public String user;
    public ShapeObj shapeObj;
    public PencilObj pencilObj;
    public SelectObj selectObj;


    public SocketDrawingEvent(String id, Point point, String type) {
        this.id = id;
        this.point = point;
        this.type = type;
    }

    public SocketDrawingEvent(String id, Point point, String type, String drawingShapeType) {
        this.id = id;
        this.point = point;
        this.type = type;
        this.drawingShapeType = drawingShapeType;
    }

    public SocketDrawingEvent(String id, String user, Point point, String type, String drawingShapeType) {
        this.id = id;
        this.user = user;
        this.point = point;
        this.type = type;
        this.drawingShapeType = drawingShapeType;
    }

    public SocketDrawingEvent(ShapeObj shapeObj, String type, String drawingShapeType) {
        this.shapeObj = shapeObj;
        this.type = type;
        this.drawingShapeType = drawingShapeType;
    }

    public SocketDrawingEvent(PencilObj pencilObj, String type) {
        this.pencilObj = pencilObj;
        this.type = type;
    }

    public SocketDrawingEvent(SelectObj selectObj, String type) {
        this.selectObj = selectObj;
        this.type = type;
    }

    @Override
    public String toString() {
        return "SocketDrawingEvent{" +
                "selectObj=" + selectObj +
                '}';
    }
}
