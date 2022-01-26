import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { ActionCreator } from '@ngrx/store';
import {
    DataConfigService,
    DataModule,
    DATA_ACTION,
    DATA_SELECTORS,
    SelectorsGroup,
} from '../src/lib';

import { TEST_CONFIG } from './test.config';

describe('DataConfigService', () => {
    jest.autoMockOn();

    const mod = DataModule.forRoot(TEST_CONFIG);
    let configService: DataConfigService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [mod, HttpClientTestingModule],
            });
        }),
    );

    it('DataConfigService be Initialized', inject(
        [DATA_SELECTORS, DATA_ACTION],
        (selectors: SelectorsGroup, action: ActionCreator<string, any>) => {
            configService = new DataConfigService(
                TEST_CONFIG,
                action,
                selectors,
            );
            expect(configService).toBeDefined();

            // Config Reading
            expect(configService.configurations).toMatchObject(TEST_CONFIG);
            expect(configService.getConfiguration().validEntity).toMatchObject(
                TEST_CONFIG.validEntity,
            );
        },
    ));

    it('getConfigByIdentifier', inject(
        [DATA_SELECTORS, DATA_ACTION],
        (selectors: SelectorsGroup, action: ActionCreator<string, any>) => {
            expect(
                configService.getConfigByIdentifier(
                    'validEntity',
                    'validEndPoint',
                ),
            ).toEqual({
                entityConfig: TEST_CONFIG.validEntity,
                endPointConfig: TEST_CONFIG.validEntity.endPoints.validEndPoint,
                action: action,
                selectors: selectors['validEntity'],
            });
        },
    ));

    it('getConfiguration', () => {
        expect(configService.getConfiguration()).toEqual(TEST_CONFIG);
    });
});
