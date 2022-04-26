package com.mocircle.cidrawing.element.shape;

import android.graphics.Path;

public class RectElement extends BoxShapeElement {

    public RectElement() {
    }

    @Override
    public Object clone() {
        RectElement element = new RectElement();
        cloneTo(element);
        return element;
    }

    @Override
    protected Path createShapePath() {
        Path path = new Path();
        path.addRect(shapeBox, Path.Direction.CW);
        return path;
    }

}
