import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Action, ActionCreator } from '@ngrx/store';
import {
    DataSandBoxService,
    DataConfigService,
    DataModule,
    DataSandBoxFactory,
    DataUtils,
    DATA_ACTION,
    DATA_SELECTORS,
    SelectorsGroup,
} from '../src/lib';
import { TEST_CONFIG } from './test.config';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

describe('DataSandBoxFactory', () => {
    jest.autoMockOn();

    let actions$: Observable<Action>;
    let factory: DataSandBoxFactory;
    let sandBox: DataSandBoxService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [DataModule.forRoot(TEST_CONFIG)],
                providers: [
                    provideMockStore(),
                    provideMockActions(() => actions$),
                    DataUtils,
                    {
                        provide: DataConfigService,
                        useFactory: (
                            action: ActionCreator<string, any>,
                            selectors: SelectorsGroup,
                        ) => {
                            return new DataConfigService(
                                TEST_CONFIG,
                                action,
                                selectors,
                            );
                        },
                        deps: [DATA_ACTION, DATA_SELECTORS],
                    },
                    {
                        provide: DataSandBoxService,
                        useFactory: () => {
                            return new DataSandBoxService(
                                'validEntity',
                                'validEndPoint',
                            );
                        },
                    },
                ],
            });
            factory = TestBed.inject(DataSandBoxFactory);
            sandBox = TestBed.inject(DataSandBoxService);
        }),
    );

    it('Should Return Valid SandBox', () => {
        expect(sandBox).toBeTruthy();
        expect(sandBox.entityId).toBe('validEntity');
        expect(sandBox.endPointId).toBe('validEndPoint');
    });

    it('should Throw Error', () => {
        expect(() => {
            sandBox = factory.create('x', 'y');
        }).toThrow(
            'Config Entity [x] with identifier [y] can not be found in configuration',
        );
    });
});
