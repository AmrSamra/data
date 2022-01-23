import {
    createFeatureSelector,
    createSelector,
    DefaultProjectorFn,
    MemoizedSelector,
} from '@ngrx/store';
import {
    BaseSelector,
    BaseState,
    DataConfig,
    DataResponse,
    SelectorsGroup,
} from '../models';

export class DataSelectorsGenerator {
    constructor(public configuration: DataConfig) {}

    /**
     * @description Get Generated Selectors Group
     * @returns SelectorsGroup
     */
    generate(): SelectorsGroup {
        const selectors = {};
        Object.keys(this.configuration).forEach((entity) => {
            const state = createFeatureSelector<BaseState>(entity);
            selectors[entity] = this.generateSelectors(state);
        });
        return selectors;
    }

    /**
     * @description Generate Selectors
     * @param selectState MemoizedSelector
     * @returns BaseSelector
     */
    generateSelectors(
        selectState: MemoizedSelector<
            object,
            BaseState,
            DefaultProjectorFn<BaseState>
        >,
    ): BaseSelector {
        return {
            selectLoading: createSelector(
                selectState,
                (genericState) => genericState?.loading,
            ),
            selectLastQuery: createSelector(
                selectState,
                (genericState) => genericState?.lastQuery,
            ),
            selectQueryHistory: createSelector(
                selectState,
                (genericState) => genericState?.history,
            ),
            selectItemsInStore: createSelector(selectState, (genericState) => {
                const items = genericState?.currentIds
                    .map((id) => genericState?.entities[id])
                    .filter((item) => !!item);
                return new DataResponse(items, {
                    total: genericState?.totalCount,
                });
            }),
            selectItemInStore: createSelector(selectState, (genericState) => {
                return (
                    genericState?.entities?.[genericState?.latestItemId] ??
                    genericState?.latestItem
                );
            }),
            selectHasItemsInStore: createSelector(selectState, (genericState) =>
                Boolean(genericState?.totalCount),
            ),
            selectItemExistsInStore: createSelector(
                selectState,
                (genericState) => {
                    const exists = Object.keys(
                        genericState?.entities ?? {},
                    ).findIndex((key) => key === genericState?.latestItemId);
                    return exists !== -1;
                },
            ),
            selectInfiniteReady: createSelector(selectState, (genericState) => {
                if (
                    genericState?.loading === null &&
                    genericState?.currentIds.length < genericState?.totalCount
                ) {
                    return genericState?.currentIds.length;
                }
                return null;
            }),
        };
    }
}
