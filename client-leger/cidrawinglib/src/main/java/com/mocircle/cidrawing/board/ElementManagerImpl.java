package com.mocircle.cidrawing.board;

import android.os.Build;

import androidx.annotation.RequiresApi;

import com.mocircle.cidrawing.element.DrawElement;
import com.mocircle.cidrawing.element.VirtualElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class ElementManagerImpl implements ElementManager {

    private String boardId;
    private List<Layer> layers = new ArrayList<>();
    private Layer currentLayer;
    private int index = 1;

    private static Map<String, Object> elementsMap;

    private List<LayerChangeListener> layerChangeListeners = new ArrayList<>();

    public ElementManagerImpl(String boardId) {
        this.boardId = boardId;
        this.elementsMap = new HashMap<>();
    }

    @Override
    public Layer[] getLayers() {
        return layers.toArray(new Layer[layers.size()]);
    }

    @Override
    public Layer getCurrentLayer() {
        return currentLayer;
    }

    public void clearAll() {
        for (int i = getCurrentObjects().length - 1; i >= 0; i--) {
            removeElementFromCurrentLayer(getCurrentObjects()[i]);
        }
    }

    @Override
    public void addElementToElementsMap(String key, Object value) {
        this.elementsMap.put(key, value);
    }

    @Override
    public Object getElementFromElementsMap(String key) {
        return elementsMap.get(key);
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    public String getShapeKey(Object value) {
        Iterator<Map.Entry<String, Object>> iter = elementsMap.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<String, Object> entry = iter.next();
            if (entry.getValue().equals(value)) {
                String key = entry.getKey();
                return key;
            }
        }
        return null;
    }


    @Override
    public void selectLayer(Layer selectedLayer) {
        currentLayer = selectedLayer;
        for (Layer layer : layers) {
            layer.setSelected(layer == selectedLayer);
        }
    }

    @Override
    public Layer selectFirstVisibleLayer() {
        for (Layer layer : layers) {
            if (layer.isVisible()) {
                selectLayer(layer);
                return currentLayer;
            }
        }
        return null;
    }

    @Override
    public Layer createNewLayer() {
        return createNewLayer("Layer " + index++);
    }

    @Override
    public Layer createNewLayer(String name) {
        Layer layer = new Layer(name);
        addLayer(layer);
        if (currentLayer == null) {
            currentLayer = layer;
        }
        return layer;
    }

    @Override
    public void addLayer(Layer layer) {
        layer.setBoardId(boardId);
        layers.add(layer);

        // Notify layer added
        for (LayerChangeListener listener : layerChangeListeners) {
            listener.onLayerChanged();
        }
    }

    @Override
    public void removeLayer(Layer layer) {
        layers.remove(layer);
        if (currentLayer == layer) {
            currentLayer = null;
        }

        // Notify layer removed
        for (LayerChangeListener listener : layerChangeListeners) {
            listener.onLayerChanged();
        }
    }

    @Override
    public void removeAllLayers() {
        layers.clear();
        currentLayer = null;

        // Notify layer removed
        for (LayerChangeListener listener : layerChangeListeners) {
            listener.onLayerChanged();
        }
    }

    @Override
    public void showLayer(Layer layer) {
        layer.setVisible(true);
    }

    @Override
    public void showAllLayers() {
        for (Layer layer : layers) {
            layer.setVisible(true);
        }
    }

    @Override
    public void hideLayer(Layer layer) {
        layer.setVisible(false);
    }

    @Override
    public void hideAllLayers() {
        for (Layer layer : layers) {
            layer.setVisible(false);
        }
    }

    @Override
    public void addLayerChangeListener(LayerChangeListener listener) {
        layerChangeListeners.add(listener);
    }

    @Override
    public void removeLayerChangeListener(LayerChangeListener listener) {
        layerChangeListeners.remove(listener);
    }

    @Override
    public DrawElement[] getVisibleObjects() {
        List<DrawElement> elements = new ArrayList<>();
        for (Layer layer : layers) {
            if (layer.isVisible()) {
                elements.addAll(Arrays.asList(layer.getLayerObjects()));
            }
        }
        return elements.toArray(new DrawElement[elements.size()]);
    }

    @Override
    public DrawElement[] getVisibleElements() {
        List<DrawElement> elements = new ArrayList<>();
        for (Layer layer : layers) {
            if (layer.isVisible()) {
                elements.addAll(Arrays.asList(layer.getElements()));
            }
        }
        return elements.toArray(new DrawElement[elements.size()]);
    }


    @Override
    public DrawElement[] getVisibleAdornments() {
        List<DrawElement> elements = new ArrayList<>();
        for (Layer layer : layers) {
            if (layer.isVisible()) {
                elements.addAll(Arrays.asList(layer.getAdornments()));
            }
        }
        return elements.toArray(new DrawElement[elements.size()]);
    }

    @Override
    public DrawElement[] getCurrentObjects() {
        if (getCurrentLayer() != null) {
            return getCurrentLayer().getLayerObjects();
        } else {
            return new DrawElement[0];
        }
    }

    @Override
    public DrawElement[] getCurrentElements() {
        if (getCurrentLayer() != null) {
            return getCurrentLayer().getElements();
        } else {
            return new DrawElement[0];
        }
    }

    @Override
    public DrawElement[] getCurrentAdornments() {
        if (getCurrentLayer() != null) {
            return getCurrentLayer().getAdornments();
        } else {
            return new DrawElement[0];
        }
    }

    @Override
    public void addElementToCurrentLayer(DrawElement element) {
        getCurrentLayer().addElement(element);
    }

    @Override
    public void removeElementFromCurrentLayer(DrawElement element) {
        getCurrentLayer().removeElement(element);
    }

    @Override
    public void addAdornmentToCurrentLayer(DrawElement element) {
        getCurrentLayer().addAdornment(element);
    }

    @Override
    public void removeAdornmentFromCurrentLayer(DrawElement element) {
        getCurrentLayer().removeAdornment(element);
    }

    @Override
    public void selectElement(DrawElement element) {
        element.setSelected(true);
    }

    @Override
    public void selectElements(List<DrawElement> elements) {
        VirtualElement virtualElement = new VirtualElement(elements);
        virtualElement.setSelected(true);
        addAdornmentToCurrentLayer(virtualElement);
    }

    @Override
    public Selection getSelection() {
        for (int i = getCurrentObjects().length - 1; i >= 0; i--) {
            DrawElement element = getCurrentObjects()[i];
            if (element.isSelected()) {
                return new Selection(element);
            }
        }
        return new Selection(null);
    }

    @Override
    public void clearSelection() {
        for (int i = getCurrentObjects().length - 1; i >= 0; i--) {
            DrawElement element = getCurrentObjects()[i];
            element.setSelected(false);
            if (element instanceof VirtualElement) {
                removeAdornmentFromCurrentLayer(element);
            }
        }
    }

    @Override
    public DrawElement getFirstHitElement(float x, float y) {
        for (int i = getCurrentObjects().length - 1; i >= 0; i--) {
            DrawElement element = getCurrentObjects()[i];
            if (element.isSelectionEnabled() && element.hitTestForSelection(x, y)) {
                return element;
            }
        }
        return null;
    }
}
