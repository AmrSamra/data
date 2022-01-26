import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DataModule, DataUtils } from '../src/lib';

import { TEST_CONFIG } from './test.config';

describe('DataUtils', () => {
    jest.autoMockOn();

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [DataModule.forRoot(TEST_CONFIG)],
                providers: [DataUtils],
            });
        }),
    );

    it('DataUtils to be Initialized', inject(
        [DataUtils],
        (dataUtils: DataUtils) => {
            expect(dataUtils).toBeDefined();
        },
    ));

    it('Fire Notice', inject([DataUtils], (dataUtils: DataUtils) => {
        const fireNotice = jest.spyOn(dataUtils, 'fireNotice');
        dataUtils.fireNotice(
            'Rand Success Message',
            'success',
            10000,
            true,
            false,
            50000,
            'bottom',
        );
        expect(fireNotice).toHaveReturned();
    }));
});
