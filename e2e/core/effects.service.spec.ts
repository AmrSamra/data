import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { Action, ActionCreator } from '@ngrx/store/src/models';
import { Observable, of } from 'rxjs';

import { DataEffectsService } from '../../src/lib/core/effects.service';
import {
    DataActionPayload,
    DataModule,
    ReducerFlag,
    DATA_ACTION,
    DataUtils,
    IResponseDto,
} from '../../src/lib';

import { ITestDto, TEST_CONFIG } from '../test.config';

describe('DataEffectsService', () => {
    jest.autoMockOn();
    let actions$: Observable<Action>;
    let action: ActionCreator<string, any>;
    let effects: DataEffectsService;
    let httpMock: HttpTestingController;

    const payload = new DataActionPayload(
        ReducerFlag.SET_ONE,
        'validEntity',
        'validEndPoint',
    )
        .withUrl('valid/path')
        .reducerAs(ReducerFlag.SET_ONE)
        .withRequest({
            itemId: 'ITEM_ID',
        })
        .fire();

    const oneResponse: IResponseDto<ITestDto> = {
        data: {
            id: 'ITEM_ID',
            name: 'ITEM_NAME',
            description: 'ITEM_DESCRIPTION',
        },
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    DataModule.forRoot(TEST_CONFIG),
                    HttpClientTestingModule,
                ],
                providers: [provideMockStore()],
            });
        }),
    );

    const createEffects = (actions$: Observable<Action>) => {
        TestBed.configureTestingModule({
            providers: [
                DataEffectsService,
                provideMockActions(() => actions$),
                DataUtils,
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        action = TestBed.inject(DATA_ACTION);
        return TestBed.inject(DataEffectsService);
    };

    afterEach(
        waitForAsync(() => {
            httpMock.verify();
        }),
    );

    it('Effect to be Defined', () => {
        effects = createEffects(actions$);
        expect(effects).toBeDefined();
    });

    it(
        'Effect onSuccess',
        waitForAsync(() => {
            actions$ = of(action(payload));
            effects = createEffects(actions$);
            effects.dataEffect.subscribe((reAction) => {
                expect(reAction).toEqual(
                    action(
                        DataActionPayload.respond(
                            payload,
                            oneResponse.data,
                            true,
                        ),
                    ),
                );
            });
            const req = httpMock.expectOne('valid/path/ITEM_ID');
            expect(req.request.method).toBe('GET');
            req.flush(oneResponse);
        }),
    );

    it(
        'Effect onFailure',
        waitForAsync(() => {
            actions$ = of(action(payload));
            effects = createEffects(actions$);
            effects.dataEffect.subscribe((reAction) => {
                expect(reAction).toEqual(
                    action(
                        DataActionPayload.respond(
                            payload,
                            new HttpErrorResponse({
                                error: {},
                                status: 404,
                                statusText: 'Failure',
                                url: 'valid/path/ITEM_ID',
                            }),
                            false,
                        ),
                    ),
                );
            });
            const req = httpMock.expectOne('valid/path/ITEM_ID');
            expect(req.request.method).toBe('GET');
            req.flush({}, { status: 404, statusText: 'Failure' });
        }),
    );
});
