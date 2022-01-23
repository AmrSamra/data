import { DefaultProjectorFn, MemoizedSelector } from '@ngrx/store';
import { DataParams, DataResponse } from '.';
import { QueryState } from './state.model';

/**
 * @description Selectors Group extends Record<string, BaseSelector>
 * @property { BaseSelector } [key: string]
 */
export interface SelectorsGroup extends Record<string, BaseSelector> {
    [key: string]: BaseSelector;
}

/**
 * @description Base Selector
 */
export interface BaseSelector
    extends Record<
        string,
        MemoizedSelector<object, any, DefaultProjectorFn<any>>
    > {
    /**
     * @description Loading indicator {string}
     */
    selectLoading: MemoizedSelector<object, string, DefaultProjectorFn<string>>;

    /**
     * @description Last Query {DataParams<any>}
     */
    selectLastQuery: MemoizedSelector<
        object,
        DataParams<any>,
        DefaultProjectorFn<DataParams<any>>
    >;

    /**
     * Queries of Params History {QueryState[]}
     */
    selectQueryHistory: MemoizedSelector<
        object,
        QueryState[],
        DefaultProjectorFn<QueryState[]>
    >;

    /**
     * @description Current Items in store related to currentIds {DataResponse}
     */
    selectItemsInStore: MemoizedSelector<
        object,
        DataResponse,
        DefaultProjectorFn<DataResponse>
    >;

    /**
     * @description current Item in store related to latestItemId {Object}
     * with structure of {id, ...attributes}}
     */
    selectItemInStore: MemoizedSelector<object, any, DefaultProjectorFn<any>>;

    /**
     * @description If Store currently has items related to currentIds {boolean}
     */
    selectHasItemsInStore: MemoizedSelector<
        object,
        boolean,
        DefaultProjectorFn<boolean>
    >;

    /**
     * @description If store has Item related to latestItemId {boolean}
     */
    selectItemExistsInStore: MemoizedSelector<
        object,
        boolean,
        DefaultProjectorFn<boolean>
    >;

    /**
     * @description Check if infinite loading is ready for next rule and
     * returns current items length in store {number | null}
     */
    selectInfiniteReady: MemoizedSelector<
        object,
        number,
        DefaultProjectorFn<number>
    >;
}
