import {
    ReducerFlag,
    BaseActionRequestBag,
    DataParams,
    DataResponse,
    BaseSelector,
    DataQueryParams,
    IReducerFlag,
    DataActionPayload,
} from '../models';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { _DataCoreInjection } from './core-injection.service';

export abstract class _DataCoreService extends _DataCoreInjection {
    public item$: Observable<any>;
    public items$: Observable<any[]>;
    public total$: Observable<number>;
    public loading$: Observable<string>;

    constructor(public entityId: string, public endPointId: string) {
        super(entityId, endPointId);
        this.setObservables();
    }

    /**
     * @protected
     * @description Set SandBox Observables
     */
    protected setObservables(): void {
        this.item$ = this.select('selectItemInStore').pipe(
            map((item) => (item ? this.mapping(item) : undefined)),
        );
        this.items$ = this.select('selectItemsInStore').pipe(
            map((result: DataResponse) =>
                result.items.length
                    ? result.items.map((item) => this.mapping(item))
                    : result.items,
            ),
        );
        this.total$ = this.items$.pipe(map((items) => items.length));
        this.loading$ = this.select('selectLoading');
    }

    /**
     * @override
     * @description Dispatch Data Default Action
     * @param flag ReducerFlag
     * @param requestBag Optional | BaseActionRequestBag
     * @param endPointVariables Optional | DataParams<string> - replacing endPoint {variables}
     */
    dispatchAction(
        flag: ReducerFlag,
        requestBag?: BaseActionRequestBag,
        endPointVariables: DataParams<string> = {},
    ): void {
        this.store.dispatch(
            this.action(
                new DataActionPayload(flag, this.entityId, this.endPointId)
                    .withUrl(this.endPointConfig.url)
                    .reducerAs(flag)
                    .withEndPointVariables(endPointVariables)
                    .withRequest(requestBag)
                    .fire(),
            ),
        );
    }

    /**
     * @override
     * @description Dispatch Data Extra Action
     * @param extraActionId string - exact extraActionId in config file
     * @param requestBag Optional | BaseActionRequestBag - contains body dto
     * @param endPointVariables Optional | DataParams<string> - replacing endPoint {variables}
     * @param reducerFlag Optional | ReducerFlag - just how reducer manage your response
     */
    dispatchExtraAction(
        extraActionId: string,
        requestBag: BaseActionRequestBag = {},
        endPointVariables: DataParams<string> = {},
        reducerFlag?: ReducerFlag,
    ): void {
        this.store.dispatch(
            this.action(
                new DataActionPayload(
                    extraActionId,
                    this.entityId,
                    this.endPointId,
                )
                    .withUrl(this.endPointConfig.url)
                    .withExtraAction(
                        this.endPointConfig.extraActions[extraActionId],
                    )
                    .withEndPointVariables(endPointVariables)
                    .withRequest(requestBag)
                    .reducerAs(reducerFlag)
                    .fire(),
            ),
        );
    }

    /**
     * @protected
     * @description Assign EndPoint flag with QueryParams
     * @param queryParams DataQueryParams
     * @param endPointVariables Optional | DataParams {string},
     * @param customFlag Optional | string
     * @returns DataQueryParams
     */
    protected getQueryParams(
        queryParams: DataQueryParams,
        endPointVariables: DataParams<string> = {},
        customFlag: string = undefined,
    ): DataQueryParams {
        return new DataQueryParams({
            ...queryParams,
            flag: {
                entityId: this.entityId,
                endPoint: this.endPointId,
                ...endPointVariables,
                customFlag,
            },
        });
    }

    /**
     * @description Observable check Infinite is ready
     * that return the next page index to use in calling the new request
     * @param maxLimitPerRequest number
     * @param startIndexCountFrom Optional | number | Default = 0
     * @returns Observable {number}
     */
    nextInfinitePageIndex(
        maxLimitPerRequest: number,
        startIndexCountFrom: number = 0,
    ): Observable<number> {
        return this.select('selectInfiniteReady').pipe(
            filter((ready: number) => !!ready),
            map(
                (ready: number) =>
                    Math.floor(ready / maxLimitPerRequest) +
                    startIndexCountFrom,
            ),
        );
    }

    /**
     * @description Call Store and select with selector
     * @param selector keyof BaseSelector<Entity> {string}
     * @returns Observable {any}
     */
    select(selector: keyof BaseSelector): Observable<any> {
        return this.store.select(this.selectors[selector]);
    }

    /**
     * @description Select specific action loading by id {ReducerFlag}
     * @param actionId ReducerFlag
     * @returns Observable {boolean}
     */
    onActionLoading(actionId: keyof IReducerFlag): Observable<boolean> {
        return this.onExtraActionLoading(actionId);
    }

    /**
     * @description Select specific action loading by id {string}
     * @param extraActionId string
     * @returns Observable {boolean}
     */
    onExtraActionLoading(extraActionId: string): Observable<boolean> {
        return this.loading$.pipe(
            map((actionID: string) => actionID === extraActionId),
        );
    }

    /**
     * @override
     * @description For Casting or Reformation Response dto
     * @param dto IResponseDto
     * @returns Entity
     */
    mapping(dto: any): any {
        return dto;
    }

    /**
     * @override
     * @description Select When Specific ReducerFlag Action Success
     * @param actionId ReducerFlag
     * @returns Observable {response as any}
     */
    onActionSuccess(actionId: keyof IReducerFlag): Observable<any> {
        return this.afterSuccess(actionId);
    }

    /**
     * @override
     * @description Select When Specific Extra Action Success
     * @param extraActionId string
     * @returns Observable {response as any}
     */
    onExtraActionSuccess(extraActionId: string): Observable<any> {
        return this.afterSuccess(extraActionId);
    }
}
