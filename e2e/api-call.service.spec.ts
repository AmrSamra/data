import { TestBed, waitForAsync } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';

import { ITestDto, TEST_CONFIG } from './test.config';
import { IResponseDto, IResponseItemsDto } from '../src/lib/dto';
import {
    DataCallMethod,
    DataQueryParams,
    DataResponse,
    DataModule,
    ApiCallService,
} from '../src/lib';

describe('ApiCallService', () => {
    jest.autoMockOn();
    let service: ApiCallService;
    let httpMock: HttpTestingController;

    const oneResponse: IResponseDto<ITestDto> = {
        data: {
            id: 'ITEM_ID',
            name: 'ITEM_NAME',
            description: 'ITEM_DESCRIPTION',
        },
    };

    const manyResponse: IResponseItemsDto<ITestDto> = {
        data: [
            oneResponse.data,
            {
                id: 'ITEM_ID_2',
                name: 'ITEM_NAME_2',
                description: 'ITEM_DESCRIPTION_2',
            },
        ],
        metadata: {
            total: 2,
        },
    };

    const _manyResponse: IResponseItemsDto<ITestDto> = {
        data: [
            oneResponse.data,
            {
                id: 'ITEM_ID_2',
                name: 'ITEM_NAME_2',
                description: 'ITEM_DESCRIPTION_2',
            },
        ],
        _meta_: {
            _total_: 33,
        },
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    DataModule.forRoot(TEST_CONFIG),
                    HttpClientTestingModule,
                ],
            });
            service = TestBed.inject(ApiCallService);
            httpMock = TestBed.inject(HttpTestingController);
        }),
    );

    afterEach(
        waitForAsync(() => {
            httpMock.verify();
        }),
    );

    it(
        'GET ONE',
        waitForAsync(() => {
            service
                .GET('get/item/ITEM_ID', { param: 'PARAM' })
                .subscribe((gottenItem) => {
                    expect(gottenItem).toEqual(oneResponse.data);
                });

            const req = httpMock.expectOne('get/item/ITEM_ID?param=PARAM');
            expect(req.request.method).toBe('GET');
            req.flush(oneResponse);
        }),
    );

    it(
        'GET ONE [Without Id]',
        waitForAsync(() => {
            const response: any = {
                data: {
                    name: 'ITEM_NAME',
                    description: 'ITEM_DESCRIPTION',
                },
            };
            service.GET('get/item').subscribe((gottenItem) => {
                expect(gottenItem.id).toBeTruthy();
            });

            const req = httpMock.expectOne('get/item');
            expect(req.request.method).toBe('GET');
            req.flush(response);
        }),
    );

    it(
        'UPDATE ONE',
        waitForAsync(() => {
            service
                .PUT('update/item/ITEM_ID', { name: 'ITEM_NAME_CHANGED' })
                .subscribe((updatedItem) => {
                    expect(updatedItem).toEqual(oneResponse.data);
                });

            const req = httpMock.expectOne('update/item/ITEM_ID');
            expect(req.request.method).toBe('PUT');
            req.flush(oneResponse);
        }),
    );

    it(
        'CREATE ONE',
        waitForAsync(() => {
            service
                .POST('create/item', oneResponse.data)
                .subscribe((createdItem) => {
                    expect(createdItem).toEqual(oneResponse.data);
                });

            const req = httpMock.expectOne('create/item');
            expect(req.request.method).toBe('POST');
            req.flush(oneResponse);
        }),
    );

    it(
        'DELETE ONE',
        waitForAsync(() => {
            service.DELETE('delete/item/ITEM_ID').subscribe((response) => {
                expect(response).toEqual(true);
            });

            const req = httpMock.expectOne('delete/item/ITEM_ID');
            expect(req.request.method).toBe('DELETE');
            req.flush({
                data: true,
            });
        }),
    );

    it(
        'GET MANY',
        waitForAsync(() => {
            service
                .LIST(
                    'get/items',
                    new DataQueryParams({
                        limit: 12,
                        skip: 0,
                        'order[createdAt]': 'desc',
                    }),
                )
                .subscribe((response) => {
                    expect(response).toEqual(
                        new DataResponse(response.items, {
                            total: response.metadata.total,
                        }),
                    );
                });

            const req = httpMock.expectOne(
                'get/items?limit=12&skip=0&order%5BcreatedAt%5D=desc',
            );
            expect(req.request.method).toBe('GET');
            req.flush(manyResponse);
        }),
    );

    it(
        'UPDATE MANY',
        waitForAsync(() => {
            service
                .BULK_PUT('update/items', {
                    itemsIds: ['ITEM_ID', 'ITEM_ID_2'],
                })
                .subscribe((response) => {
                    expect(response).toEqual(true);
                });

            const req = httpMock.expectOne('update/items');
            expect(req.request.method).toBe('PUT');
            req.flush({
                data: true,
            });
        }),
    );

    it(
        'CREATE MANY',
        waitForAsync(() => {
            service
                .BULK_POST('create/items', oneResponse.data)
                .subscribe((createdItem) => {
                    expect(createdItem).toEqual(oneResponse.data);
                });

            const req = httpMock.expectOne('create/items');
            expect(req.request.method).toBe('POST');
            req.flush(oneResponse);
        }),
    );

    it(
        'DELETE MANY',
        waitForAsync(() => {
            service.DELETE('delete/items').subscribe((deletedItem) => {
                expect(deletedItem).toEqual(true);
            });

            const req = httpMock.expectOne('delete/items');
            expect(req.request.method).toBe('DELETE');
            req.flush({
                data: true,
            });
        }),
    );

    it(
        'CALL [GET ONE]',
        waitForAsync(() => {
            service
                .CALL(DataCallMethod.GET, 'get/item/ITEM_ID', {
                    body: {
                        param: 'PARAM',
                    },
                })
                .subscribe((gottenItem) => {
                    expect(gottenItem).toEqual(oneResponse.data);
                });

            const req = httpMock.expectOne('get/item/ITEM_ID?param=PARAM');
            expect(req.request.method).toBe('GET');
            req.flush(oneResponse);
        }),
    );

    it(
        'CALL [GET MANY] NORMAL',
        waitForAsync(() => {
            service
                .CALL(DataCallMethod.GET, 'get/items', {
                    queryParams: new DataQueryParams({
                        limit: 12,
                        skip: 0,
                        'order[createdAt]': 'desc',
                    }),
                })
                .subscribe((response) => {
                    expect(response).toEqual(
                        new DataResponse(response.items, {
                            total: response.totalCount,
                        }),
                    );
                    expect(response.items).toEqual(manyResponse.data);
                    expect(response.totalCount).toBe(2);
                });

            const req = httpMock.expectOne(
                'get/items?limit=12&skip=0&order%5BcreatedAt%5D=desc',
            );
            expect(req.request.method).toBe('GET');
            req.flush(manyResponse);
        }),
    );

    it(
        'CALL [GET MANY] DIFF',
        waitForAsync(() => {
            service
                .CALL(DataCallMethod.GET, 'get/items', {
                    queryParams: new DataQueryParams({}),
                })
                .subscribe((response) => {
                    expect(response.totalCount).toBe(33);
                });

            const req = httpMock.expectOne('get/items');
            expect(req.request.method).toBe('GET');
            req.flush(_manyResponse);
        }),
    );
});
