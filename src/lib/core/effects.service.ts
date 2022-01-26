import { Inject, Injectable } from '@angular/core';
import { ActionCreator } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { ApiCallService } from './api-call.service';
import { Actions, createEffect } from '@ngrx/effects';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import {
    DataAction,
    DataActionPayload,
    DataConfig,
    ReducerFlagMethod,
} from '../models';
import { DATA_ACTION, DATA_CONFIG } from '../data.tokens';
import { DataUtils } from '../data-utils.service';
import { dataActionsFilter } from '../helper';

@Injectable()
export class DataEffectsService {
    dataEffect: Observable<DataActionPayload>;
    constructor(
        @Inject(DATA_CONFIG) public config: DataConfig,
        @Inject(DATA_ACTION)
        public action: ActionCreator<
            string,
            (props: DataAction) => DataActionPayload
        >,
        public actions$: Actions<DataActionPayload>,
        public apiCall: ApiCallService,
        public dataUtils: DataUtils,
    ) {
        this.createEffect();
    }

    /**
     * @description Create Data Generic Effect
     * @returns Observable<Action>
     */
    createEffect(): void {
        this.dataEffect = createEffect(() =>
            this.actions$.pipe(
                filter(
                    (payload) => dataActionsFilter(payload) && !!payload.method,
                ),
                mergeMap((payload) =>
                    this.apiCall
                        .CALL(
                            payload.method,
                            payload.callUrl,
                            payload.requestBag,
                        )
                        .pipe(
                            map((response) =>
                                this.onSuccess(payload, response),
                            ),
                            catchError((error) =>
                                this.onFailure(payload, error),
                            ),
                        ),
                ),
            ),
        );
    }

    /**
     * @description Handle afterEffect on Success
     * @param payload DataActionPayload
     * @param response any
     * @returns DataActionPayload
     */
    onSuccess(payload: DataActionPayload, response: any): DataActionPayload {
        const action = DataActionPayload.respond(payload, response, true);
        let message: string[];
        if (Object.keys(ReducerFlagMethod).includes(action.id)) {
            message = this.generateBaseActionsSuccessMessage(action);
        } else {
            message = this.getExtraActionsSuccessMessage(action);
        }
        if (message.length) {
            this.dataUtils.fireNotice(message, 'success');
        }
        return this.action(action);
    }

    /**
     * @description Handle afterEffect on Failure
     * @param payload DataActionPayload
     * @param error any
     * @returns Observable{DataActionPayload}
     */
    onFailure(
        payload: DataActionPayload,
        error: any,
    ): Observable<DataActionPayload> {
        const action = DataActionPayload.respond(payload, error, false);
        let message = action?.error?.error?.message;
        if (!message) {
            message = ['An Unknown Error Occurred'];
        }
        this.dataUtils.fireNotice(message, 'danger');
        return of(this.action(action));
    }

    /**
     * @description Generate Success Message for Base Endpoint Actions
     * @param actionId string
     * @returns messages as array
     */
    generateBaseActionsSuccessMessage(action: DataActionPayload): string[] {
        let messages: string[];
        const naming = this.config?.[action.entityId]?.naming;
        switch (action.id) {
            case 'addOne':
                messages = [
                    `${naming.singular} has been Created Successfully!`,
                ];
                break;
            case 'updateOne':
                messages = [
                    `${naming.singular} has been Updated Successfully!`,
                ];
                break;
            case 'removeOne':
                messages = [
                    `${naming.singular} has been Deleted Successfully!`,
                ];
                break;
            case 'addMany':
                messages = [`${naming.plural} have been Created Successfully!`];
                break;
            case 'updateMany':
                messages = [
                    `Selected ${naming.plural} have been Updated Successfully!`,
                ];
                break;
            case 'removeMany':
                messages = [
                    `Selected ${naming.plural} have been Deleted Successfully!`,
                ];
                break;
            default:
                messages = [];
                break;
        }
        return messages;
    }

    /**
     * @description Get Success Message for Endpoint Extra Actions
     * @param actionId string
     * @returns messages as array
     */
    getExtraActionsSuccessMessage(action: DataActionPayload): string[] {
        let messages = ['Action has been executed Successfully!'];
        const extraAction =
            this.config?.[action.entityId].endPoints?.[action.endPointId]
                ?.extraActions?.[action.id];
        if (extraAction && extraAction.onSuccessMessage?.length) {
            messages = [extraAction.onSuccessMessage];
        }
        return messages;
    }
}
