import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { ActionCreator } from '@ngrx/store';

import {
    BaseState,
    DataModule,
    DATA_ACTION,
    getInitialState,
    ReducerFlag,
    DataActionPayload,
    DataQueryParams,
    DataResponse,
    QueryState,
} from '../../src/lib';
import { DataReducersService } from '../../src/lib/core/reducers.service';
import { TEST_CONFIG } from '../test.config';

describe('DataReducersService<T', () => {
    jest.autoMockOn();
    let reducerService: DataReducersService;
    let adapter: EntityAdapter<any>;
    let initialState: BaseState;
    let flag: ReducerFlag;
    let payload: DataActionPayload;
    let newState: BaseState;
    const validWithIn = TEST_CONFIG['validEntity'].validWithIn;

    const itemResponse1 = {
        id: '1st_ITEM_ID',
        name: 'Default Item 1',
        description: 'Default ItemDescription 1',
    };

    const itemChanges = {
        id: '1st_ITEM_ID',
        name: 'Custom Item 1',
        description: 'Custom ItemDescription 1',
    };

    const itemResponse2 = {
        id: '2nd_ITEM_ID',
        name: 'Default Item 2',
        description: 'Default ItemDescription 2',
    };

    const itemsList: any[] = [itemResponse1, itemResponse2];

    const currentItemState: BaseState = {
        ...initialState,
        latestItemId: itemResponse1.id,
        latestItem: itemResponse1,
        entities: { [itemResponse1.id]: itemResponse1 },
        ids: [itemResponse1.id],
        history: [],
    };

    const currentListState: BaseState = {
        ...initialState,
        entities: {
            [itemResponse1.id]: itemResponse1,
            [itemResponse2.id]: itemResponse2,
        },
        ids: itemsList.map((item) => item.id),
        history: [],
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [DataModule.forRoot(TEST_CONFIG)],
            });
            adapter = createEntityAdapter();
            initialState = getInitialState(adapter);
            expect(initialState).toEqual({
                ids: [],
                entities: {},
                loading: null,
                latestItemId: undefined,
                latestItem: undefined,
                totalCount: 0,
                lastQuery: undefined,
                history: [],
                currentIds: [],
            });
        }),
    );

    it(
        'Getting Feature By Slug',
        waitForAsync(
            inject([DATA_ACTION], (action: ActionCreator<string, any>) => {
                reducerService = new DataReducersService(action, TEST_CONFIG);
                const reducer = reducerService.getFeature('validEntity');
                const feature = reducer(initialState, action);
                expect(feature).toMatchObject(initialState);
            }),
        ),
    );

    it('GET_ONE ReducerFlag', () => {
        flag = ReducerFlag.GET_ONE;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemId: '1st_ITEM_ID',
            });
        newState = reducerService.switchReducerFlag(
            adapter,
            currentItemState,
            payload,
            validWithIn,
        );
        expect(newState.latestItemId).toBe('1st_ITEM_ID');
        expect(newState.latestItem).toEqual(itemResponse1);
    });

    it('ADD_ONE ReducerFlag', () => {
        flag = ReducerFlag.ADD_ONE;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withResponse(itemResponse1, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            { ...initialState, history: [{} as QueryState] },
            payload,
            validWithIn,
        );
        expect(newState.history).toEqual([]);
        expect(newState.latestItem).toEqual(itemResponse1);
        expect(newState.entities['1st_ITEM_ID']).toEqual(itemResponse1);
    });

    it('SET_ONE ReducerFlag', () => {
        flag = ReducerFlag.SET_ONE;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemId: '1st_ITEM_ID',
            })
            .withResponse(itemChanges, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            {
                ...initialState,
                entities: { itemResponse1 },
                ids: ['1st_ITEM_ID'],
            },
            payload,
            validWithIn,
        );
        expect(newState.latestItemId).toBe('1st_ITEM_ID');
        expect(newState.latestItem).toEqual(itemChanges);
        expect(newState.entities['1st_ITEM_ID']).toEqual(itemChanges);
    });

    it('REMOVE_ONE ReducerFlag', () => {
        flag = ReducerFlag.REMOVE_ONE;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemId: '1st_ITEM_ID',
            })
            .withResponse({}, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            currentItemState,
            payload,
            validWithIn,
        );
        expect(newState.latestItemId).toBeUndefined();
        expect(newState.latestItem).toBeUndefined();
        expect(newState.entities['1st_ITEM_ID']).toBeUndefined();
    });

    it('GET_MANY ReducerFlag', () => {
        flag = ReducerFlag.GET_MANY;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemsIds: itemsList.map((item) => item.id),
                totalCount: 2,
            });
        newState = reducerService.switchReducerFlag(
            adapter,
            currentListState,
            payload,
            validWithIn,
        );
        expect(newState.totalCount).toEqual(2);
        expect(newState.currentIds).toEqual([
            itemResponse1.id,
            itemResponse2.id,
        ]);
    });

    it('SET_MANY ReducerFlag', () => {
        flag = ReducerFlag.SET_MANY;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                queryParams: new DataQueryParams(),
            })
            .withResponse(
                new DataResponse(itemsList, { total: itemsList.length }),
                true,
            );
        expect(initialState.history).toEqual([]);
        const now = new Date();
        newState = reducerService.switchReducerFlag(
            adapter,
            initialState,
            payload,
            validWithIn,
        );
        expect(newState.ids).toEqual(itemsList.map((item) => item.id));
        expect(newState.currentIds).toEqual(itemsList.map((item) => item.id));
        expect(newState.totalCount).toBe(itemsList.length);
        expect(newState.lastQuery).toEqual(new DataQueryParams());
        expect(newState.history).toEqual([
            {
                ids: itemsList.map((item) => item.id),
                params: new DataQueryParams(),
                totalCount: itemsList.length,
                expireTime: validWithIn
                    ? now.setMinutes(now.getMinutes() + validWithIn)
                    : 0,
            } as QueryState,
        ]);
    });

    it('ADD_MANY ReducerFlag', () => {
        flag = ReducerFlag.ADD_MANY;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withResponse(itemsList, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            { ...initialState, history: [{} as QueryState] },
            payload,
            validWithIn,
        );
        expect(newState.history).toEqual([]);
        expect(newState.ids).toEqual(itemsList.map((item) => item.id));
        expect(newState.entities[itemResponse1.id]).toEqual(itemResponse1);
        expect(newState.entities[itemResponse2.id]).toEqual(itemResponse2);
    });

    it('UPDATE_MANY ReducerFlag', () => {
        flag = ReducerFlag.UPDATE_MANY;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemsIds: itemsList.map((item) => item.id),
            })
            .withResponse({ name: 'Item Name Changed' }, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            currentListState,
            payload,
            validWithIn,
        );
        expect(newState.entities[itemResponse1.id].name).toBe(
            'Item Name Changed',
        );
        expect(newState.entities[itemResponse2.id].name).toEqual(
            'Item Name Changed',
        );
    });

    it('REMOVE_MANY ReducerFlag', () => {
        flag = ReducerFlag.REMOVE_MANY;
        payload = new DataActionPayload(flag, 'validEntity', 'validEndPoint')
            .reducerAs(flag)
            .withRequest({
                itemsIds: itemsList.map((item) => item.id),
            })
            .withResponse({}, true);
        newState = reducerService.switchReducerFlag(
            adapter,
            currentItemState,
            payload,
            validWithIn,
        );
        expect(newState.ids).toEqual([]);
        expect(newState.entities).toEqual({});
    });

    it('Types Set', () => {
        const types = reducerService.types;
        expect(types).toBeTruthy();
        const validEntity = types.filter(
            (type) => type.entityId === 'validEntity',
        );
        expect(validEntity).toHaveLength(30);
        validEntity.forEach((type, i) => {
            switch (i >= 3 ? i % 3 : i) {
                case 0:
                    expect(type.status).toBeUndefined();
                    break;
                case 1:
                    expect(type.status).toBe('Success');
                    break;
                case 2:
                    expect(type.status).toBe('Failure');
                    break;
            }
        });
    });
});
