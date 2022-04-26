import { Injectable, Type } from '@angular/core';
import { ControlMenuComponent } from 'src/app/components/control-menu/control-menu.component';
import { EllipseToolParameterComponent } from 'src/app/components/tool-parameters/ellipse-tool-parameter/ellipse-tool-parameter.component';
import { EraserToolParameterComponent } from 'src/app/components/tool-parameters/eraser-tool-parameter/eraser-tool-parameter.component';
import { LineToolParameterComponent } from 'src/app/components/tool-parameters/line-tool-parameter/line-tool-parameter.component';
import { PencilToolParameterComponent } from 'src/app/components/tool-parameters/pencil-tool-parameter/pencil-tool-parameter.component';
import { PolygonToolParameterComponent } from 'src/app/components/tool-parameters/polygon-tool-parameter/polygon-tool-parameter.component';
import { RectangleToolParameterComponent } from 'src/app/components/tool-parameters/rectangle-tool-parameter/rectangle-tool-parameter.component';
import { SelectionToolParameterComponent } from 'src/app/components/tool-parameters/selection-tool-parameter/selection-tool-parameter.component';

/// Classe permettant d'offrir dyamiquement des component selon un index
@Injectable({
  providedIn: 'root',
})
export class ParameterComponentService {

  private parameterComponentList: Type<any>[] = [];
  constructor() {
    this.parameterComponentList.push(
      SelectionToolParameterComponent,
      EraserToolParameterComponent,
      PencilToolParameterComponent,
      RectangleToolParameterComponent,
      EllipseToolParameterComponent,
      PolygonToolParameterComponent,
      LineToolParameterComponent,
    );
    // Le push se fait par la suite pour s'assurer qu'il s'agit de la derniere classe
    this.parameterComponentList.push(ControlMenuComponent);
  }

  /// Retourne le parameterComponent de l'index donner
  getComponent(index: number): Type<any> {
    return this.parameterComponentList[index];
  }
}
