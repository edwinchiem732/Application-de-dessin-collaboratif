export const OBJECT_ATTRIBUTE_STRUCTURE: Record<string, Record<string, string>> = {
    pencil: {
        primaryColor: 'stroke',
        primaryOpacity: 'opacity',
        secondaryColor: 'none',
        secondaryOpacity: 'none',
        x: 'x',
        y: 'y',
        width: 'width',
        height: 'height',
    },

    line: {
        primaryColor: 'stroke',
        primaryOpacity: 'stroke-opacity',
        secondaryColor: 'none',
        secondaryOpacity: 'none',
        x: 'x',
        y: 'y',
        width: 'width',
        height: 'height',
    },

    rectangle: {
        primaryColor: 'fill',
        primaryOpacity: 'fill-opacity',
        secondaryColor: 'stroke',
        secondaryOpacity: 'stroke-opacity',
        x: 'x',
        y: 'y',
        width: 'width',
        height: 'height',
    },

    ellipse: {
        primaryColor: 'fill',
        primaryOpacity: 'fill-opacity',
        secondaryColor: 'stroke',
        secondaryOpacity: 'stroke-opacity',
        x: 'cx',
        y: 'cy',
        width: 'width',
        height: 'height',
    },

    dot: {
      primaryColor: 'fill',
      primaryOpacity: 'fill-opacity',
      secondaryColor: 'stroke',
      secondaryOpacity: 'stroke-opacity',
      x: 'cx',
      y: 'cy',
      width: 'width',
      height: 'height',
  },

    polygon: {
        primaryColor: 'fill',
        primaryOpacity: 'fill-opacity',
        secondaryColor: 'stroke',
        secondaryOpacity: 'stroke-opacity',
        x: 'none',
        y: 'none',
        width: 'none',
        height: 'none',
    },

};
