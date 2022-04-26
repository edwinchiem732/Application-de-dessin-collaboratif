package com.mocircle.cidrawing.utils;

public class ShapeObj {
    private String id;
    private String user;
    private int x;
    private int y;
    private int finalX;
    private int finalY;
    private int width;
    private int height;
    private int strokeWidth;
    private String fill;
    private String stroke;
    private String fillOpacity;
    private String strokeOpacity;
    private String type;


    public ShapeObj(String id,
                    String user,
                    int x,
                    int y,
                    int finalX,
                    int finalY,
                    int width,
                    int height,
                    int strokeWidth,
                    String fill,
                    String stroke,
                    String fillOpacity,
                    String strokeOpacity
    ) {
        this(id, user, x, y, finalX, finalY, width, height, strokeWidth, fill, stroke, fillOpacity, strokeOpacity, SupportedShapeType.RECTANGLE);
    }

    public ShapeObj(String id,
                    String user,
                    int x,
                    int y,
                    int finalX,
                    int finalY,
                    int width,
                    int height,
                    int strokeWidth,
                    String fill,
                    String stroke,
                    String fillOpacity,
                    String strokeOpacity,
                    String type
    ) {
        this.id = id;
        this.user = user;
        this.x = x;
        this.y = y;
        this.finalX = finalX;
        this.finalY = finalY;
        this.width = width;
        this.height = height;
        this.strokeWidth = strokeWidth;
        this.fill = fill;
        this.stroke = stroke;
        this.fillOpacity = fillOpacity;
        this.strokeOpacity = strokeOpacity;
        this.type = type;
    }


    public String getId() {
        return id;
    }

    public String getUser() {
        return user;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getFinalX() {
        return finalX;
    }

    public int getFinalY() {
        return finalY;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
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

    public String getType() {
        return type;
    }

    @Override
    public String toString() {
        return "ShapeObj{" +
                "id='" + id + '\'' +
                ", user='" + user + '\'' +
                ", x=" + x +
                ", y=" + y +
                ", finalX=" + finalX +
                ", finalY=" + finalY +
                ", width=" + width +
                ", height=" + height +
                ", strokeWidth='" + strokeWidth + '\'' +
                ", fill='" + fill + '\'' +
                ", stroke='" + stroke + '\'' +
                ", fillOpacity='" + fillOpacity + '\'' +
                ", strokeOpacity='" + strokeOpacity + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
