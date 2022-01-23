import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, ActionCreator } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
    DataModule,
    DataConfigService,
    SelectorsGroup,
    ApiCallService,
    DataActionPayload,
    DATA_ACTION,
    DATA_SELECTORS,
    DATA_CONFIG,
    DataConfig,
    DataUtils,
} from '../src/lib';
import { DataSelectorsGenerator } from '../src/lib/core/selectors.service';
import { DataEffectsService } from '../src/lib/core/effects.service';
import { DataReducersService } from '../src/lib/core/reducers.service';
import { TEST_CONFIG } from './test.config';

describe('Initialize Test', () => {
    const mod = DataModule.forRoot(TEST_CONFIG);
    const actions$ = new Observable<DataActionPayload>();
    let configService: DataConfigService;
    let selectorService: DataSelectorsGenerator;
    let effectService: DataEffectsService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [mod, HttpClientTestingModule],
                providers: [provideMockActions(() => actions$), DataUtils],
            });
        }),
    );

    it('Module Initialized', () => {
        expect(mod).toBeTruthy();
        expect(mod.providers).toBeTruthy();
    });

    it(
        'DATA_ACTION be Injected',
        waitForAsync(
            inject([DATA_ACTION], (action: ActionCreator<string, any>) => {
                expect(action).toBeDefined();
                expect(action.type).toBe('[Data]');
            }),
        ),
    );
    it(
        'DATA_SELECTORS be Injected',
        waitForAsync(
            inject([DATA_SELECTORS], (selectors: SelectorsGroup) => {
                expect(selectors).toBeDefined();
            }),
        ),
    );

    it(
        'DataConfigService be Initialized',
        waitForAsync(
            inject(
                [DATA_SELECTORS, DATA_ACTION],
                (
                    selectors: SelectorsGroup,
                    action: ActionCreator<string, any>,
                ) => {
                    configService = new DataConfigService(
                        TEST_CONFIG,
                        action,
                        selectors,
                    );
                    expect(configService).toBeDefined();
                },
            ),
        ),
    );

    it('Config Reading in DataConfigService', () => {
        expect(configService.configurations).toMatchObject(TEST_CONFIG);
        expect(configService.getConfiguration().validEntity).toMatchObject(
            TEST_CONFIG.validEntity,
        );
    });

    it('DataSelectorsGenerator be Initialized', () => {
        selectorService = new DataSelectorsGenerator(TEST_CONFIG);
        expect(selectorService).toBeDefined();
    });

    it('Selectors Reading in DataSelectorsService', () => {
        const selectors = selectorService.generate();
        expect(selectors).toHaveProperty('validEntity');
        expect(selectors.validEntity).toHaveProperty('selectLoading');
        expect(selectors.validEntity).toHaveProperty('selectLastQuery');
        expect(selectors.validEntity).toHaveProperty('selectQueryHistory');
        expect(selectors.validEntity).toHaveProperty('selectItemsInStore');
        expect(selectors.validEntity).toHaveProperty('selectItemInStore');
        expect(selectors.validEntity).toHaveProperty('selectHasItemsInStore');
        expect(selectors.validEntity).toHaveProperty('selectItemExistsInStore');
    });

    it(
        'DataEffectsService be Initialized',
        waitForAsync(
            inject(
                [DATA_CONFIG, DATA_ACTION, ApiCallService, DataUtils],
                (
                    config: DataConfig,
                    action: ActionCreator<string, any>,
                    apiCall: ApiCallService,
                    dataUtils: DataUtils,
                ) => {
                    effectService = new DataEffectsService(
                        config,
                        action,
                        actions$,
                        apiCall,
                        dataUtils,
                    );
                    expect(effectService).toBeDefined();
                },
            ),
        ),
    );

    it('Effect Creating in DataEffectsService', () => {
        const effect = effectService.dataEffect;
        expect(effect).toMatchObject(new Observable<Action>());
    });

    it(
        'DataReducersService be Initialized',
        waitForAsync(
            inject([DATA_ACTION], (action: ActionCreator<string, any>) => {
                const service = new DataReducersService(action, TEST_CONFIG);
                expect(service).toBeDefined();
            }),
        ),
    );
});
