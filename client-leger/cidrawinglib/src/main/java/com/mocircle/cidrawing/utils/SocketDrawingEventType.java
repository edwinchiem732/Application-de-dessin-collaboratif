package com.mocircle.cidrawing.utils;

public class SocketDrawingEventType {

    public static final String START_LINE = "STARTLINE";
    public static final String DRAW_LINE = "DRAWLINE";
    public static final String END_LINE = "ENDLINE";

    public static final String START_RECTANGLE = "STARTRECTANGLE";
    public static final String DRAW_RECTANGLE = "DRAWRECTANGLE";
    public static final String END_RECTANGLE = "ENDRECTANGLE";

    public static final String START_OVAL = "STARTELLIPSE";
    public static final String DRAW_OVAL = "DRAWELLIPSE";
    public static final String END_OVAL = "ENDELLIPSE";

    public static final String START_SHAPE = "STARTSHAPE";
    public static final String DRAW_SHAPE = "DRAWSHAPE";
    public static final String END_SHAPE = "ENDSHAPE";

    public static final String START_SELECTION = "STARTSELECT";
    public static final String DRAW_SELECTION = "DRAWSELECT";
    public static final String END_SELECTION = "ENDSELECT";
    public static final String DELETE_SELECTION = "DELETESHAPE";
    public static final String RESIZE_SELECTION = "SIZESELECT";
    public static final String DOWN_SELECT = "DOWNSELECT";

    public static final String RESET_DRAWING = "RESETDRAWING";

}
