import { Inject, Injectable } from '@angular/core';
import { first, withLatestFrom } from 'rxjs/operators';
import { queryParamsExists } from './helper';
import { _DataCoreService } from './core/core.service';
import {
    BaseActionRequestBag,
    DataParams,
    DataQueryParams,
    DataResponse,
    QueryState,
    ReducerFlag,
} from './models';

/**
 * @description Initial Data Service that you can extend it with any entity
 */
@Injectable()
export class DataSandBoxService extends _DataCoreService {
    constructor(
        @Inject(String) public entityId: string,
        @Inject(String) public endPointId: string = 'default',
    ) {
        super(entityId, endPointId);
    }
    /**
     * @description CREATE one Item
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    create(
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        this.dispatchAction(ReducerFlag.ADD_ONE, { body }, endPointVariables);
    }

    /**
     * @description GET One Item
     * @param itemId string
     * @param params Optional | DataParams{string}
     * @param endPointVariables Optional | DataParams{string}
     */
    read(
        itemId: string,
        params?: DataParams<string>,
        endPointVariables?: DataParams<string>,
    ): void {
        const requestBag: BaseActionRequestBag = {
            ...{ body: params },
            itemId,
        };
        this.select('selectItemExistsInStore')
            .pipe(first())
            .subscribe((exists: boolean) => {
                if (exists) {
                    this.dispatchAction(
                        ReducerFlag.GET_ONE,
                        requestBag,
                        endPointVariables,
                    );
                } else {
                    this.dispatchAction(
                        ReducerFlag.SET_ONE,
                        requestBag,
                        endPointVariables,
                    );
                }
            });
    }

    /**
     * @description GET FORCE One Item with force API call
     * @param itemId string
     * @param params Optional | DataParams{string}
     * @param endPointVariables Optional | DataParams{string}
     */
    readForced(
        itemId: string,
        params?: DataParams<string>,
        endPointVariables?: DataParams<string>,
    ): void {
        const requestBag: BaseActionRequestBag = {
            ...{ body: params },
            itemId,
        };
        // Get item temporary from store if exists until we get new response
        this.dispatchAction(ReducerFlag.GET_ONE, requestBag, endPointVariables);
        // Call Api for refresh item data with new response
        this.dispatchAction(ReducerFlag.SET_ONE, requestBag, endPointVariables);
    }

    /**
     * @description UPDATE One Item
     * @param itemId string
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    update(
        itemId: string,
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        const requestBag: BaseActionRequestBag = { body, itemId };
        this.dispatchAction(
            ReducerFlag.UPDATE_ONE,
            requestBag,
            endPointVariables,
        );
    }

    /**
     * @description DELETE One Item
     * @param itemId string
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    delete(
        itemId: string,
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        const requestBag: BaseActionRequestBag = { body, itemId };
        this.dispatchAction(
            ReducerFlag.REMOVE_ONE,
            requestBag,
            endPointVariables,
        );
    }

    /**
     * @description CREATE BULK Items
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    bulkCreate(
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        this.dispatchAction(ReducerFlag.ADD_MANY, { body }, endPointVariables);
    }

    /**
     * @description GET LIST of items
     * @param queryParams Optional | QueryParams
     * @param endPointVariables Optional | DataParams{string}
     * @param customFlag Optional | string
     */
    listRead(
        queryParams?: DataQueryParams,
        endPointVariables?: DataParams<string>,
        customFlag?: string,
    ): void {
        const requestBag: BaseActionRequestBag = {
            queryParams: this.getQueryParams(
                queryParams,
                endPointVariables,
                customFlag,
            ),
        };

        this.select('selectQueryHistory')
            .pipe(first())
            .subscribe((history: QueryState[]) => {
                const existState = queryParamsExists(
                    history,
                    requestBag.queryParams,
                );
                if (existState) {
                    requestBag.itemsIds = existState.ids;
                    requestBag.totalCount = existState.totalCount;
                    this.dispatchAction(
                        ReducerFlag.GET_MANY,
                        requestBag,
                        endPointVariables,
                    );
                    return;
                }

                this.dispatchAction(
                    ReducerFlag.SET_MANY,
                    requestBag,
                    endPointVariables,
                );
            });
    }

    /**
     * @description GET LIST of items for infinite scroll with cumulative results in same store
     * @param queryParams Optional | QueryParams
     * @param endPointVariables Optional | DataParams{string}
     * @param customFlag Optional | string
     */
    listReadInfinity(
        queryParams?: DataQueryParams,
        endPointVariables?: DataParams<string>,
        customFlag?: string,
    ): void {
        this.select('selectQueryHistory')
            .pipe(withLatestFrom(this.select('selectItemsInStore')), first())
            .subscribe(([history, response]: [QueryState[], DataResponse]) => {
                const requestBag: BaseActionRequestBag = {
                    queryParams: this.getQueryParams(
                        queryParams,
                        endPointVariables,
                        customFlag,
                    ),
                    response: response?.items,
                };
                const existState = queryParamsExists(
                    history,
                    requestBag.queryParams,
                );
                if (existState) {
                    requestBag.itemsIds = existState.ids;
                    requestBag.totalCount = existState.totalCount;
                    this.dispatchAction(
                        ReducerFlag.GET_MANY,
                        requestBag,
                        endPointVariables,
                    );
                    return;
                }

                this.dispatchAction(
                    ReducerFlag.SET_MANY,
                    requestBag,
                    endPointVariables,
                );
            });
    }

    /**
     * @description GET LIST FORCE of items with force API call
     * @param queryParams Optional | QueryParams
     * @param endPointVariables Optional | DataParams{string}
     */
    listReadForced(
        queryParams?: DataQueryParams,
        endPointVariables?: DataParams<string>,
        customFlag?: string,
    ): void {
        const requestBag: BaseActionRequestBag = {
            queryParams: this.getQueryParams(
                queryParams,
                endPointVariables,
                customFlag,
            ),
        };

        this.dispatchAction(
            ReducerFlag.SET_MANY,
            requestBag,
            endPointVariables,
        );
    }

    /**
     * @description UPDATE BULK Items
     * @param itemsIds string[]
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    bulkUpdate(
        itemsIds: string[],
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        this.dispatchAction(
            ReducerFlag.UPDATE_MANY,
            { itemsIds, body },
            endPointVariables,
        );
    }

    /**
     * @description DELETE BULK Items
     * @param itemsIds string[]
     * @param body Optional | DataParams{any}
     * @param endPointVariables Optional | DataParams{string}
     */
    bulkDelete(
        itemsIds: string[],
        body?: DataParams<any>,
        endPointVariables?: DataParams<string>,
    ): void {
        this.dispatchAction(
            ReducerFlag.REMOVE_MANY,
            { itemsIds, body },
            endPointVariables,
        );
    }
}
