import { TestBed, waitForAsync } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { createEntityAdapter } from '@ngrx/entity';
import { Action, ActionCreator, Store } from '@ngrx/store';

import {
    DataConfigService,
    DataModule,
    DataSandBoxService,
    getInitialState,
    DataQueryParams,
    ReducerFlag,
    SelectorsGroup,
    DATA_ACTION,
    DATA_SELECTORS,
    DataUtils,
    dataActionsFilter,
    DataActionPayload,
} from '../src/lib';

import { TEST_CONFIG } from './test.config';

describe('DataSandBoxService', () => {
    jest.autoMockOn();
    const adapter = createEntityAdapter();
    const initialState = getInitialState(adapter);
    let store: MockStore;
    let actions$: Observable<Action>;
    let sandBox: DataSandBoxService;
    let httpMock: HttpTestingController;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    DataModule.forRoot(TEST_CONFIG),
                    HttpClientTestingModule,
                ],
                providers: [
                    provideMockStore({
                        initialState,
                        selectors: [
                            {
                                selector: 'selectLoading',
                                value: null,
                            },
                            {
                                selector: 'selectLastQuery',
                                value: {},
                            },
                            {
                                selector: 'selectQueryHistory',
                                value: [],
                            },
                            {
                                selector: 'selectLastQuery',
                                value: undefined,
                            },
                            {
                                selector: 'selectItemsInStore',
                                value: [],
                            },
                            {
                                selector: 'selectItemInStore',
                                value: undefined,
                            },
                            {
                                selector: 'selectHasItemsInStore',
                                value: false,
                            },
                            {
                                selector: 'selectItemExistsInStore',
                                value: false,
                            },
                        ],
                    }),
                    provideMockActions(() => actions$),
                    DataUtils,
                    {
                        provide: Store,
                        useClass: MockStore,
                    },
                    {
                        provide: DataConfigService,
                        useFactory: (
                            action: ActionCreator,
                            selector: SelectorsGroup,
                        ) => {
                            return new DataConfigService(
                                TEST_CONFIG,
                                action,
                                selector,
                            );
                        },
                        deps: [DATA_ACTION, DATA_SELECTORS],
                    },
                    {
                        provide: DataSandBoxService,
                        useFactory: () => {
                            return new DataSandBoxService(
                                'extraEntity',
                                'extraEndPoint',
                            );
                        },
                    },
                ],
            });
            store = TestBed.inject(MockStore);
            actions$ = store.scannedActions$;
            sandBox = TestBed.inject(DataSandBoxService);
            httpMock = TestBed.inject(HttpTestingController);
        }),
    );

    afterEach(
        waitForAsync(() => {
            httpMock.verify();
        }),
    );

    it('SandBox to be Initialized', () => {
        expect(sandBox).toBeDefined();
    });

    it(
        'Force READ ONE',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.SET_ONE);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('GET');
                    expect(reAction.callUrl).toBe(
                        'extra/VARIABLE/path/ITEM_ID',
                    );
                    expect(reAction.requestBag.body).toEqual({
                        param: 'PARAM',
                    });
                });
            // Dispatch Action
            sandBox.readForced(
                'ITEM_ID',
                { param: 'PARAM' },
                { variable: 'VARIABLE' },
            );
        }),
    );

    it(
        'GET ONE',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.GET_ONE);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBeNull();
                    expect(reAction.callUrl).toBeUndefined();
                    expect(reAction.requestBag.body).toEqual({
                        param: 'PARAM',
                    });
                });
            // Dispatch Action
            sandBox.read(
                'ITEM_ID',
                { param: 'PARAM' },
                { variable: 'VARIABLE' },
            );
        }),
    );

    it(
        'UPDATE ONE',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.UPDATE_ONE);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('PUT');
                    expect(reAction.callUrl).toBe(
                        'extra/VARIABLE/path/ITEM_ID',
                    );
                    expect(reAction.requestBag.body).toEqual({
                        status: 'OPEN',
                    });
                });
            // Dispatch Action
            sandBox.update(
                'ITEM_ID',
                { status: 'OPEN' },
                { variable: 'VARIABLE' },
            );
        }),
    );

    it(
        'CREATE ONE',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.ADD_ONE);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('POST');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.body).toEqual({
                        id: 'ITEM_ID',
                        name: 'ITEM_NAME',
                    });
                });
            // Dispatch Action
            sandBox.create(
                { id: 'ITEM_ID', name: 'ITEM_NAME' },
                { variable: 'VARIABLE' },
            );
        }),
    );

    it(
        'DELETE ONE',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.REMOVE_ONE);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('DELETE');
                    expect(reAction.callUrl).toBe(
                        'extra/VARIABLE/path/ITEM_ID',
                    );
                    expect(reAction.requestBag.body).toEqual({});
                });
            // Dispatch Action
            sandBox.delete('ITEM_ID', {}, { variable: 'VARIABLE' });
        }),
    );

    it(
        'Force READ LIST',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.SET_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('GET');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.queryParams).toEqual(
                        new DataQueryParams({
                            flag: {
                                customFlag: undefined,
                                endPoint: 'extraEndPoint',
                                entityId: 'extraEntity',
                                variable: 'VARIABLE',
                            },
                        }),
                    );
                });
            // Dispatch Action
            sandBox.listReadForced(new DataQueryParams(), {
                variable: 'VARIABLE',
            });
        }),
    );

    it(
        'GET LIST',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.SET_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('GET');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.queryParams).toEqual(
                        new DataQueryParams({
                            flag: {
                                customFlag: 'TESTING_FLAG',
                                endPoint: 'extraEndPoint',
                                entityId: 'extraEntity',
                                variable: 'VARIABLE',
                            },
                        }),
                    );
                    expect(reAction.requestBag.response).toBeUndefined();
                });
            // Dispatch Action
            sandBox.listRead(
                new DataQueryParams(),
                {
                    variable: 'VARIABLE',
                },
                'TESTING_FLAG',
            );
        }),
    );

    it(
        'GET LIST Infinite',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.SET_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('GET');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.queryParams).toEqual(
                        new DataQueryParams({
                            flag: {
                                customFlag: 'TESTING_FLAG',
                                endPoint: 'extraEndPoint',
                                entityId: 'extraEntity',
                                variable: 'VARIABLE',
                            },
                        }),
                    );
                    expect(reAction.requestBag.response).toEqual([]);
                });
            // Dispatch Action
            sandBox.listReadInfinity(
                new DataQueryParams(),
                {
                    variable: 'VARIABLE',
                },
                'TESTING_FLAG',
            );
        }),
    );

    it(
        'UPDATE BULK',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.UPDATE_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('PUT');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.body).toEqual({
                        itemsId: ['ITEM_ID_1', 'ITEM_ID_2'],
                    });
                });
            // Dispatch Action
            sandBox.bulkUpdate(
                ['ITEM_ID_1', 'ITEM_ID_2'],
                {
                    itemsId: ['ITEM_ID_1', 'ITEM_ID_2'],
                },
                {
                    variable: 'VARIABLE',
                },
            );
        }),
    );

    it(
        'CREATE BULK',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.ADD_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('POST');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.body).toEqual({
                        description: 'ITEM_DESCRIPTION',
                    });
                });
            // Dispatch Action
            sandBox.bulkCreate(
                {
                    description: 'ITEM_DESCRIPTION',
                },
                {
                    variable: 'VARIABLE',
                },
            );
        }),
    );

    it(
        'DELETE BULK',
        waitForAsync(() => {
            actions$
                .pipe(
                    filter(
                        (payload: DataActionPayload) =>
                            dataActionsFilter(payload) && !!payload.method,
                    ),
                    first(),
                )
                .subscribe((reAction) => {
                    expect(reAction.id).toEqual(ReducerFlag.REMOVE_MANY);
                    expect(reAction.id).toEqual(reAction.reducerFlag);
                    expect(reAction.method).toBe('DELETE');
                    expect(reAction.callUrl).toBe('extra/VARIABLE/path');
                    expect(reAction.requestBag.body).toEqual({
                        itemsId: ['ITEM_ID_1', 'ITEM_ID_2'],
                    });
                });
            // Dispatch Action
            sandBox.bulkDelete(
                ['ITEM_ID_1', 'ITEM_ID_2'],
                {
                    itemsId: ['ITEM_ID_1', 'ITEM_ID_2'],
                },
                {
                    variable: 'VARIABLE',
                },
            );
        }),
    );
});
