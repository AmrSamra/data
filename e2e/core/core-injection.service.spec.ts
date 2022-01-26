import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';

import { Observable } from 'rxjs';
import { createEntityAdapter } from '@ngrx/entity';
import { Action, ActionCreator, Store } from '@ngrx/store';

import {
    DataConfigService,
    DataModule,
    DataSandBoxService,
    getInitialState,
    SelectorsGroup,
    DATA_ACTION,
    DATA_SELECTORS,
    DataUtils,
    AppState,
    DataActionPayload,
} from '../../src/lib';

import { TEST_CONFIG } from '../test.config';

describe('_DataCoreInjection', () => {
    jest.autoMockOn();
    const adapter = createEntityAdapter();
    const initialState = getInitialState(adapter);
    let actions$: Observable<Action>;
    let sandBox: DataSandBoxService;

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
            sandBox = TestBed.inject(DataSandBoxService);
        }),
    );

    it(
        'Core To Be Injected',
        waitForAsync(() => {
            expect(sandBox).toBeTruthy();
            expect(sandBox.entityId).toBe('extraEntity');
            expect(sandBox.endPointId).toBe('extraEndPoint');
            expect(sandBox.store).toBeDefined();
            expect(sandBox.action).toBeDefined();
        }),
    );

    it(
        'Injected Store',
        waitForAsync(() => {
            sandBox.store.subscribe((state: AppState) => {
                expect(state).toBe(initialState);
            });
        }),
    );

    it(
        'Injected Action',
        waitForAsync(() => {
            expect(
                sandBox.action(
                    new DataActionPayload(
                        'setOne',
                        'extraEntity',
                        'extraEndPoint',
                    ),
                ),
            ).toMatchObject({
                type: '[Data]',
                id: 'setOne',
                entityId: 'extraEntity',
                endPointId: 'extraEndPoint',
                method: 'GET',
            });
        }),
    );
});
