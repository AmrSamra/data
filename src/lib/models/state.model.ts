import { EntityAdapter, EntityState } from '@ngrx/entity';
import { DataParams } from './query-params.model';

/**
 * @description Base State extends EntityState<any>
 */
export interface BaseState extends EntityState<any> {
    loading: string;

    latestItemId: string;
    latestItem: any;

    totalCount: number;
    lastQuery: DataParams<any>;
    history: QueryState[];
    currentIds: string[];
}

/**
 * @description QueryState as an history of previous requests
 */
export interface QueryState {
    params: DataParams<any>;
    ids: string[];
    totalCount: number;
    expireTime: number;
}

export function getInitialState(adapter: EntityAdapter<any>): BaseState {
    return adapter.getInitialState({
        loading: null,
        latestItemId: undefined,
        latestItem: undefined,

        totalCount: 0,
        lastQuery: undefined,
        history: [],
        currentIds: [],
    });
}
