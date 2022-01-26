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
    ReducerFlag,
    SelectorsGroup,
    DATA_ACTION,
    DATA_SELECTORS,
    DataUtils,
    dataActionsFilter,
    DataActionPayload,
} from '../../src/lib';

import { TEST_CONFIG } from '../test.config';

describe('_DataCoreService', () => {
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
        'EXTRA ACTION',
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
                    expect(reAction.id).toEqual('extraActionId');
                    expect(reAction.reducerFlag).toEqual(ReducerFlag.SET_ONE);
                    expect(reAction.method).toBe('GET');
                    expect(reAction.callUrl).toBe('another/url/ID/path');
                    expect(reAction.requestBag.body).toEqual({
                        param: 'PARAM',
                    });
                });
            // Dispatch Extra Action
            sandBox.dispatchExtraAction(
                'extraActionId',
                {
                    itemId: 'ITEM_ID',
                    body: {
                        param: 'PARAM',
                    },
                },
                { id: 'ID' },
                ReducerFlag.SET_ONE,
            );
        }),
    );
});
