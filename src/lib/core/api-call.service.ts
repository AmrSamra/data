import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IMetadata, IResponseDto, IResponseItemsDto } from '../dto';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import * as uuid from 'uuid';
import {
    BaseActionRequestBag,
    DataCallMethod,
    DataParams,
    DataResponse,
    DataQueryParams,
} from '../models';

@Injectable()
export class ApiCallService {
    protected httpHeaders: HttpHeaders = new HttpHeaders();
    constructor(public http: HttpClient) {
        this.httpHeaders.set('Content-Type', 'application/json');
    }

    /**
     * @description Generic API Call
     * @param method string one of DataCallMethod/s
     * @param endPoint string
     * @param requestBag Optional | BaseActionRequestBag
     * @returns Observable of response
     */
    CALL(
        method: DataCallMethod,
        endPoint: string,
        requestBag?: BaseActionRequestBag,
    ): Observable<any> {
        if (requestBag.queryParams instanceof DataQueryParams) {
            return this.LIST(endPoint, requestBag?.queryParams);
        }
        return this[method](endPoint, requestBag.body ?? undefined);
    }

    /**
     * @description GET API Call
     * @param endPoint string
     * @param params Optional | DataParams of {string}
     * @returns Observable of response
     */
    GET(endPoint: string, params?: DataParams<string>): Observable<any> {
        return this._GET(endPoint, params).pipe(
            map((response: IResponseDto<any>) => {
                return { ...response.data, id: response.data.id ?? uuid.v4() };
            }),
        );
    }

    /**
     * @description POST API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    POST(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._POST(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description PUT API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    PUT(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._PUT(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description DELETE API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    DELETE(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._DELETE(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description List GET API Call
     * @param endPoint string
     * @param queryParams DataQueryParams
     * @returns Observable of response
     */
    LIST(
        endPoint: string,
        queryParams: DataQueryParams,
    ): Observable<DataResponse> {
        return this._LIST(endPoint, queryParams).pipe(
            mergeMap((res) => {
                // Search for metadata key
                const metaKey: string = res
                    ? Object.keys(res).find(
                          (key) =>
                              typeof res?.[key] === 'object' &&
                              key.search('meta') !== -1,
                      )
                    : null;

                // Metadata
                const metadata: IMetadata = res?.[metaKey];

                return of(
                    new DataResponse(
                        res.data.map((item) => {
                            // assign temporary id if the item has not
                            return { ...item, id: item.id ?? uuid.v4() };
                        }),
                        metadata,
                    ),
                );
            }),
        );
    }

    /**
     * @description BULK POST API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    BULK_POST(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._POST(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description BULK PUT API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    BULK_PUT(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._PUT(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description BULK DELETE API Call
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    BULK_DELETE(endPoint: string, body?: DataParams<any>): Observable<any> {
        return this._PUT(endPoint, body).pipe(
            map((response: IResponseDto<any>) => response.data),
        );
    }

    /**
     * @description Perform POST Request
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    protected _POST(
        endPoint: string,
        body?: DataParams<any>,
    ): Observable<IResponseDto<any>> {
        return this.http.post<IResponseDto<any>>(endPoint, body, {
            headers: this.httpHeaders,
        });
    }

    /**
     * @description Perform GET Request
     * @param endPoint string
     * @param params Optional | DataParams of {string}
     * @returns Observable of response
     */
    protected _GET(
        endPoint: string,
        params?: DataParams<string>,
    ): Observable<IResponseDto<any>> {
        return this.http.get<IResponseDto<any>>(endPoint, {
            headers: this.httpHeaders,
            params,
        });
    }

    /**
     * @description Perform PUT Request
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    protected _PUT(
        endPoint: string,
        body?: DataParams<any>,
    ): Observable<IResponseDto<any>> {
        return this.http.put<IResponseDto<any>>(endPoint, body, {
            headers: this.httpHeaders,
        });
    }

    /**
     * @description Perform DELETE Request
     * @param endPoint string
     * @param body Optional | DataParams of {any}
     * @returns Observable of response
     */
    protected _DELETE(
        endPoint: string,
        body?: DataParams<any>,
    ): Observable<any> {
        return this.http.request<IResponseDto<any>>('delete', endPoint, {
            headers: this.httpHeaders,
            body,
        });
    }

    /**
     * @description Perform List GET Request
     * @param endPoint string
     * @param queryParams DataQueryParams
     * @returns Observable of response
     */
    protected _LIST(
        endPoint: string,
        queryParams: DataQueryParams,
    ): Observable<IResponseItemsDto<any>> {
        return this.http.get<IResponseItemsDto<any>>(endPoint, {
            headers: this.httpHeaders,
            params: queryParams.send(),
        });
    }
}
