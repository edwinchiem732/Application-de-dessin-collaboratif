
//////////////////////////// --IMPORTANT--///////////////////////////////
// Les tests seront a changer selon ce que l'on emet dans les hotkeys //
////////////////////////////////////////////////////////////////////////

import { EventEmitter, Injectable, Output } from '@angular/core';
import { CTRL, EmitReturn, KeyCodes, SHIFT } from '../hotkeys-constants';

/// Service de hotkey pour les fonctions de travail
@Injectable({
  providedIn: 'root',
})
export class HotkeysEmitterService {

  canExecute = true;
  @Output() hotkeyEmitter = new EventEmitter<EmitReturn>();

  private hotkeyTranslationMap: Map<string, EmitReturn>;

  constructor() {
    this.hotkeyTranslationMap = new Map<string, EmitReturn>();
    this.hotkeyTranslationMap.set(KeyCodes.delete, EmitReturn.DELETE);
    this.hotkeyTranslationMap.set(CTRL + KeyCodes.x, EmitReturn.CUT);
    this.hotkeyTranslationMap.set(CTRL + KeyCodes.c, EmitReturn.COPY);
    this.hotkeyTranslationMap.set(CTRL + KeyCodes.v, EmitReturn.PASTE);
    this.hotkeyTranslationMap.set(CTRL + KeyCodes.d, EmitReturn.DUPLICATE);
    this.hotkeyTranslationMap.set(KeyCodes.delete, EmitReturn.DELETE);
    this.hotkeyTranslationMap.set(CTRL + KeyCodes.a, EmitReturn.SELECTALL);
    //this.hotkeyTranslationMap.set(CTRL + KeyCodes.o, EmitReturn.NEW_DRAWING);
    //this.hotkeyTranslationMap.set(CTRL + KeyCodes.s, EmitReturn.SAVE_DRAWING);
    //this.hotkeyTranslationMap.set(CTRL + KeyCodes.g, EmitReturn.OPEN_DRAWING);
    //this.hotkeyTranslationMap.set(CTRL + KeyCodes.e, EmitReturn.EXPORT_DRAWING);
    this.hotkeyTranslationMap.set(KeyCodes.m, EmitReturn.MUTE);
    this.hotkeyTranslationMap.set(KeyCodes.n, EmitReturn.UNMUTE);
    this.hotkeyTranslationMap.set(KeyCodes.z, EmitReturn.CHAT);
    this.hotkeyTranslationMap.set(KeyCodes.c, EmitReturn.PENCIL);
    this.hotkeyTranslationMap.set(KeyCodes.r, EmitReturn.RECTANGLE);
    this.hotkeyTranslationMap.set(KeyCodes.r, EmitReturn.RECTANGLE);
    this.hotkeyTranslationMap.set(KeyCodes.e, EmitReturn.ELLIPSE);
    this.hotkeyTranslationMap.set(KeyCodes.e, EmitReturn.ELLIPSE);
    //this.hotkeyTranslationMap.set(KeyCodes.b3, EmitReturn.POLYGON);
    //this.hotkeyTranslationMap.set(KeyCodes.np3, EmitReturn.POLYGON);
    //this.hotkeyTranslationMap.set(KeyCodes.l, EmitReturn.LINE);
    //this.hotkeyTranslationMap.set(KeyCodes.e, EmitReturn.ERASER);
    this.hotkeyTranslationMap.set(KeyCodes.s, EmitReturn.SELECTION);
  }
  /// Emet le enum de la fonction de travail associer au hotkey
  handleKeyboardEvent(event: KeyboardEvent): string | void {
    if (this.canExecute) {
      let key = '';
      if (event.ctrlKey) {
        key += CTRL;
      }
      if (event.shiftKey) {
        key += SHIFT;
      }
      const hotkeyReturn = this.hotkeyTranslationMap.get(key + event.code);
      if (hotkeyReturn) {
        event.preventDefault();
        this.hotkeyEmitter.emit(hotkeyReturn);
      }
    }
  }
}
