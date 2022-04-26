package com.mocircle.cidrawing.utils;

public class SelectObj {
    private Point off;
    private String identif;
    private int x;
    private int y;
    private boolean inside = true;
    private boolean bool = true;

    public SelectObj(Point off, String identif) {
        this.off = off;
        this.identif = identif;
    }

    public SelectObj(Point off, String identif, int x, int y) {
        this(off, identif);
        this.x = x;
        this.y = y;
    }

    public SelectObj(Point off, String identif, int x, int y, boolean inside) {
        this(off, identif, x, y);
        this.inside = inside;
    }

    public SelectObj(Point off, String identif, Boolean inside) {
        this(off, identif);
        this.inside = inside;
    }

    public SelectObj(Boolean bool) {
        this.bool = bool;
    }

    public Point getOff() {
        return off;
    }

    public String getIdentif() {
        return identif;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public boolean getInside() {
        return inside;
    }

    public boolean getBool() {
        return bool;
    }


    @Override
    public String toString() {
        return "SelectObj{" +
                "off=" + off +
                ", identif='" + identif + '\'' +
                ", x='" + x + '\'' +
                ", y='" + y + '\'' +
                ", inside='" + inside + '\'' +
                ", bool='" + bool + '\'' +
                '}';
    }
}
