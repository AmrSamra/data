import { BaseState } from './state.model';

/**
 * @description Standard App State extends Record<string, BaseState>
 * @property {BaseState} [key: string]
 */
export interface AppState extends Record<string, BaseState> {
    [key: string]: BaseState;
}
