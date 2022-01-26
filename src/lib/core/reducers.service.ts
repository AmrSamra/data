import { Inject, Injectable } from '@angular/core';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import {
    Action,
    ActionCreator,
    ActionReducer,
    createReducer,
} from '@ngrx/store';
import { DATA_ACTION } from '../data.tokens';
import {
    BaseState,
    getInitialState,
    DataConfig,
    ReducerFlag,
    QueryState,
    DataActionPayload,
    DataAction,
    on,
    DataParams,
} from '../models';

@Injectable()
export class DataReducersService {
    types: DataParams<string>[] = [];
    constructor(
        @Inject(DATA_ACTION)
        public action: ActionCreator<
            string,
            (props: DataAction) => DataActionPayload
        >,
        @Inject(String) public configuration: DataConfig,
    ) {
        this.setTypes();
    }

    /**
     * @description Create Reducer for certain Feature
     * @param entityId string
     * @returns ActionReducer<BaseState, Action>
     */
    getFeature(entityId: string): ActionReducer<BaseState, Action> {
        const adapter = createEntityAdapter();
        const initialState = getInitialState(adapter);
        const actionTypes = this.types.filter(
            (type) => entityId === type.entityId,
        );

        return createReducer(
            initialState,
            on(
                actionTypes,
                (oldState: BaseState, action: DataActionPayload) => {
                    const state = Object.assign({}, oldState);
                    const validWithIn =
                        this.configuration?.[action.entityId]?.validWithIn ?? 0;
                    if (validWithIn) {
                        state.history = state.history.filter((state) =>
                            state.expireTime
                                ? new Date().getTime() < state.expireTime
                                : true,
                        );
                    }
                    if (action.entityId !== entityId) {
                        return state;
                    }
                    if (action.method) {
                        if (action.reducerFlag === 'setMany') {
                            state.lastQuery = action.requestBag?.queryParams;
                        }
                        return { ...state, loading: action.id };
                    }
                    if (action.status === 'Failure') {
                        return { ...state, loading: null };
                    }
                    return this.switchReducerFlag(
                        adapter,
                        { ...state, loading: null },
                        action as DataActionPayload,
                        validWithIn,
                    );
                },
            ),
        );
    }

    /**
     * @description Decide what the reducer doing depends on Flag Cases
     * @param adapter EntityAdapter
     * @param state BaseState
     * @param action DataActionPayload
     * @returns BaseState
     */
    switchReducerFlag(
        adapter: EntityAdapter<any>,
        state: BaseState,
        action: DataActionPayload,
        validWithIn: number,
    ): BaseState {
        const now = new Date();
        switch (action.reducerFlag) {
            case ReducerFlag.GET_ONE: // on Get one already Exists in Store
                state.latestItemId = action.requestBag?.itemId;
                break;
            case ReducerFlag.ADD_ONE: // on Create new & store
                state.history = [];
                if (action.response?.id) {
                    state.latestItem = action.response;
                    state.latestItemId = action.response.id;
                    state = adapter.upsertOne(action.response, state);
                }
                break;
            case ReducerFlag.SET_ONE: // on Get one not exists & store
                state.latestItemId = action.requestBag?.itemId;
                if (action.response?.id) {
                    state.latestItem = action.response;
                    state = adapter.upsertOne(action.response, state);
                }
                break;
            case ReducerFlag.UPDATE_ONE:
                state.latestItemId = action.requestBag?.itemId;
                state = adapter.updateOne(
                    {
                        id: action.requestBag?.itemId,
                        changes: action.response ?? {},
                    },
                    state,
                );
                break;
            case ReducerFlag.REMOVE_ONE:
                state.latestItemId = undefined;
                state.latestItem = undefined;
                state = adapter.removeOne(action.requestBag?.itemId, state);
                break;
            case ReducerFlag.GET_MANY: // on Get Many already Exists in Store
                state.currentIds = action.requestBag?.itemsIds;
                state.totalCount = action.requestBag?.totalCount;
                state.lastQuery = action.requestBag?.queryParams;
                break;
            case ReducerFlag.SET_MANY: // on Get Many not exists & store
                if (Array.isArray(action.response?.items)) {
                    state.currentIds = action.response?.items.map((e) => e.id);
                    state.totalCount = action.response?.totalCount;
                    state.lastQuery = action.requestBag.queryParams;
                    state.history = [
                        {
                            ids: state.currentIds,
                            totalCount: state.totalCount,
                            params: state.lastQuery,
                            expireTime: validWithIn
                                ? now.setMinutes(now.getMinutes() + validWithIn)
                                : 0,
                        } as QueryState,
                        ...state.history,
                    ];
                    state = adapter.upsertMany(action.response?.items, state);
                }
                break;
            case ReducerFlag.ADD_MANY: // on Create new & store
                state.history = [];
                if (Array.isArray(action.response)) {
                    state = adapter.upsertMany(action.response, state);
                }
                break;
            case ReducerFlag.UPDATE_MANY:
                state = adapter.updateMany(
                    action.requestBag?.itemsIds?.map((id) => {
                        return {
                            id,
                            changes: action.response ?? {},
                        };
                    }),
                    state,
                );
                break;
            case ReducerFlag.REMOVE_MANY:
                state = adapter.removeMany(action.requestBag.itemsIds, state);
                break;
            default:
                break;
        }
        return state;
    }

    /**
     * @description Set All Available Reducer Types
     */
    setTypes(): void {
        Object.keys(this.configuration ?? {}).forEach((entityId) => {
            return Object.keys(
                this.configuration[entityId]?.endPoints ?? {},
            ).map((endPointId) => {
                const extra =
                    this.configuration[entityId].endPoints[endPointId]
                        ?.extraActions;
                this.types.push(
                    ...Object.keys(extra ?? {})
                        .map((id) => {
                            return this.resolveType(id, entityId, endPointId);
                        })
                        .flat(),
                    ...Object.keys(ReducerFlag)
                        .map((flag) => {
                            return this.resolveType(
                                ReducerFlag[flag],
                                entityId,
                                endPointId,
                            );
                        })
                        .flat(),
                );
            });
        });
    }

    /**
     * @description Resolve type into 3 stats [Request, Response (success, failure)]
     * @param id string
     * @param entityId string
     * @param endPointId string
     * @returns array of 3 stats
     */
    resolveType(
        id: string,
        entityId: string,
        endPointId: string,
    ): DataParams<string>[] {
        return [undefined, 'Success', 'Failure'].map((status) => {
            return {
                id,
                entityId,
                endPointId,
                status,
            };
        });
    }
}
