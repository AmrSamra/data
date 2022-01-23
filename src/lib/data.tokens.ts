import { InjectionToken } from '@angular/core';
import { ActionCreator } from '@ngrx/store';
import { DataActionPayload } from './core';
import { DataConfig } from './models';
import { DataAction } from './models/action.model';
import { SelectorsGroup } from './models/selector.model';

export const DATA_CONFIG = new InjectionToken<DataConfig>('DATA_CONFIG');

export const DATA_ACTION = new InjectionToken<
    ActionCreator<string, (props: DataAction) => DataActionPayload>
>('DATA_ACTION');

export const DATA_SELECTORS = new InjectionToken<SelectorsGroup>(
    'DATA_SELECTORS',
);
