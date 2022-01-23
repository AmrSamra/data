import { waitForAsync } from '@angular/core/testing';
import { createFeatureSelector } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import { BaseState, BaseSelector } from '../src/lib';
import { DataSelectorsGenerator } from '../src/lib/core/selectors.service';
import { TEST_CONFIG } from './test.config';

describe('DataSelectorsService', () => {
    jest.autoMockOn();
    let service: DataSelectorsGenerator;

    const entities = ['validEntity', 'extraEntity'];

    beforeEach(
        waitForAsync(() => {
            service = new DataSelectorsGenerator(TEST_CONFIG);
        }),
    );

    it(
        'Generate Selector for slug [ValidEntity]',
        waitForAsync(() => {
            const state = createFeatureSelector<BaseState>('validEntity');
            const validSelector = service.generateSelectors(state);
            expectFromSelector(validSelector).subscribe((pass: boolean) =>
                expect(pass).toBeTruthy(),
            );
        }),
    );

    it(
        'Generate All Selectors',
        waitForAsync(() => {
            const selectors = service.generate();
            for (const i in entities) {
                expect(selectors).toHaveProperty(entities[i]);
                expectFromSelector(selectors[entities[i]]).subscribe(
                    (pass: boolean) => expect(pass).toBeTruthy(),
                );
            }
        }),
    );

    function expectFromSelector(selector: BaseSelector): Observable<boolean> {
        expect(selector).toBeDefined();
        expect(selector).toHaveProperty('selectLoading');
        expect(selector).toHaveProperty('selectLastQuery');
        expect(selector).toHaveProperty('selectQueryHistory');
        expect(selector).toHaveProperty('selectLastQuery');
        expect(selector).toHaveProperty('selectItemsInStore');
        expect(selector).toHaveProperty('selectItemInStore');
        expect(selector).toHaveProperty('selectHasItemsInStore');
        expect(selector).toHaveProperty('selectItemExistsInStore');
        expect(selector).toHaveProperty('selectInfiniteReady');
        return of(true);
    }
});
