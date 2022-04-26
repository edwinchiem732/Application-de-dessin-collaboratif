package com.mocircle.cidrawing.utils;

import java.util.Arrays;

public class PencilObj {
    private String id;
    private String user;
    private Point[] pointsList;
    private int strokeWidth;
    private String fill;
    private String stroke;
    private String fillOpacity;
    private String strokeOpacity;

    public PencilObj(String id, String user, Point[] pointsList, int strokeWidth, String fill, String stroke, String fillOpacity, String strokeOpacity) {
        this.id = id;
        this.user = user;
        this.pointsList = pointsList;
        this.strokeWidth = strokeWidth;
        this.fill = fill;
        this.stroke = stroke;
        this.fillOpacity = fillOpacity;
        this.strokeOpacity = strokeOpacity;
    }

    public String getId() {
        return id;
    }

    public String getUser() {
        return user;
    }

    public Point[] getPointsList() {
        return pointsList;
    }

    public int getStrokeWidth() {
        return strokeWidth;
    }

    public String getFill() {
        return fill;
    }

    public String getStroke() {
        return stroke;
    }

    public String getFillOpacity() {
        return fillOpacity;
    }

    public String getStrokeOpacity() {
        return strokeOpacity;
    }

    @Override
    public String toString() {
        return "PencilObj{" +
                "id='" + id + '\'' +
                ", user='" + user + '\'' +
                ", pointsList=" + Arrays.toString(pointsList) +
                ", strokeWidth=" + strokeWidth +
                ", fill='" + fill + '\'' +
                ", stroke='" + stroke + '\'' +
                ", fillOpacity='" + fillOpacity + '\'' +
                ", strokeOpacity='" + strokeOpacity + '\'' +
                '}';
    }
}

