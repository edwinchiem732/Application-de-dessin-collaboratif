package com.mocircle.cidrawing.mode.selection;

import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.shape.RectElement;

public class RectSelectionMode extends ShapeSelectionMode {

    public RectSelectionMode() {
    }

    @Override
    protected DrawElement createSelectionElement() {
        return new RectElement();
    }

}
