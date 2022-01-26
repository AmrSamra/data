import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { BaseState, DataParams, getInitialState } from '../../src/lib';

describe('StateModel', () => {
    jest.autoMockOn();
    const adapter: EntityAdapter<any> = createEntityAdapter();

    it('getInitialState', () => {
        const initialState = getInitialState(adapter);
        expect(initialState).toMatchObject({} as BaseState);
        expect(initialState).toEqual({
            entities: {},
            ids: [],
            loading: null,
            latestItemId: undefined,
            latestItem: undefined,

            totalCount: 0,
            lastQuery: undefined,
            history: [],
            currentIds: [],
        });
    });
});
