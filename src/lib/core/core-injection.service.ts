import { inject } from '@angular/core';
import { ActionCreator, Store } from '@ngrx/store';
import {
    BaseSelector,
    AppState,
    DataAction,
    DataConfigEndPoint,
} from '../models';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataActionPayload } from './actions.service';
import { ConfigByIdentifier, DataConfigService } from '../data.config';
import { Actions } from '@ngrx/effects';
import { dataActionsFilter } from '../helper';

export abstract class _DataCoreInjection {
    public store: Store<AppState>;
    public action: ActionCreator<
        string,
        (props?: DataAction) => DataActionPayload
    >;

    protected endPointConfig: DataConfigEndPoint;
    protected actions$: Actions<DataActionPayload>;
    protected configuration: ConfigByIdentifier;
    protected selectors: BaseSelector;
    constructor(public entityId: string, public endPointId: string) {
        this.configuration = inject(DataConfigService).getConfigByIdentifier(
            entityId,
            endPointId,
        );
        this.store = inject(Store);
        this.actions$ = inject(Actions);
        this.setConfig();
    }

    /**
     * @protected
     * @description Set Configuration related to this Entity & EndPoint
     */
    protected setConfig(): void {
        this.action = this.configuration.action;
        this.endPointConfig = this.configuration.endPointConfig;
        this.selectors = this.configuration.selectors;
    }

    /**
     * @protected
     * @description Select When Specific Any Action Success
     * @param actionId
     * @returns Observable {response as any}
     */
    protected afterSuccess(actionId: string): Observable<any> {
        return this.actions$.pipe(
            filter(
                (payload: DataActionPayload) =>
                    dataActionsFilter(payload, {
                        entityId: this.entityId,
                        endPointId: this.endPointId,
                    }) &&
                    payload.status === 'Success' &&
                    payload.id === actionId,
            ),
            map((payload: DataActionPayload) => payload.response),
        );
    }
}
