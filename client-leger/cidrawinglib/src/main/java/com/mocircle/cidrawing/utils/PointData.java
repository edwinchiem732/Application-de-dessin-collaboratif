package com.mocircle.cidrawing.utils;

public class PointData {
    private String shapeId;
    private Point point;

    public PointData(String shapeId, Point point) {
        this.shapeId = shapeId;
        this.point = point;
    }

    public String getShapeId() {
        return shapeId;
    }

    public void setShapeId(String shapeId) {
        this.shapeId = shapeId;
    }

    public Point getPoint() {
        return point;
    }

    public void setPoint(Point point) {
        this.point = point;
    }

    @Override
    public String toString() {
        return "PointData{" +
                "shapeId='" + shapeId + '\'' +
                ", point=" + point +
                '}';
    }
}
