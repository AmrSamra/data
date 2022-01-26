/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@angular/core';

/**
 * @description Has to provided inside your app module as mask for you custom utils service
 */
@Injectable()
export class DataUtils {
    /**
     * @description Handling notice firing
     * @param message string
     * @param type string | default = 'info'
     * @param duration number | default = 10000
     * @param showCloseButton boolean | default = true
     * @param showUndoButton boolean | default = false
     * @param undoButtonDuration number | default = 3000
     * @param verticalPosition string | default = 'button'
     */
    fireNotice(
        _message: string | string[],
        _type?: 'primary' | 'success' | 'danger' | 'warning' | 'dark' | 'info',
        _duration?: number,
        _showCloseButton?: boolean,
        _showUndoButton?: boolean,
        _undoButtonDuration?: number,
        _verticalPosition?: 'top' | 'bottom',
    ): void {
        return;
    }
}
