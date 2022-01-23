import { Action } from '@ngrx/store';
import {
    BaseActionRequestBag,
    DataAction,
    DataBaseActionURL,
    DataCallMethod,
    DataExtraAction,
    DataParams,
    DataQueryParams,
    DataResponse,
    ReducerFlag,
    ReducerFlagMethod,
} from '../models';
import { generateActionType } from '../helper';

export class DataActionPayload implements DataAction, Action {
    url?: DataBaseActionURL;
    callUrl?: string;
    method?: DataCallMethod;

    // Request
    requestBag?: BaseActionRequestBag;

    // Response
    reducerFlag?: ReducerFlag;
    response?: any;
    status?: 'Success' | 'Failure';
    error?: any;

    // TypedAction
    type: string;
    constructor(
        public id: string,
        public entityId: string,
        public endPointId: string,
    ) {
        // Set Method
        this.method = ReducerFlagMethod[id];
    }

    /**
     * @description Reverse same action to be response of API Call
     * @param payload DataAction
     * @param response any
     * @param success boolean
     * @returns Self
     */
    static respond(
        payload: DataAction,
        response: any,
        success: boolean,
    ): DataActionPayload {
        return new DataActionPayload(
            payload.id,
            payload.entityId,
            payload.endPointId,
        )
            .reducerAs(payload.reducerFlag)
            .withRequest(payload.requestBag)
            .withResponse(
                success
                    ? payload.requestBag?.onSuccessChanges ?? response
                    : response,
                success,
            )
            .fire();
    }

    /**
     * @description Provide action with url
     * @param url Base EndPoint Url
     * @param extraUrl Optional | EndPoint Extra Url Extension or FullNewPath
     * @param variables Optional | EndPoint Variables
     * @returns Self
     */
    withUrl(
        url: string,
        extraUrl?: string,
        variables?: DataParams<string>,
    ): DataActionPayload {
        this.url = {
            base: url,
            extraUrl,
            variables,
        };
        return this;
    }

    /**
     * @description Provide API Calling Method
     * @param method DataCallMethod
     * @returns Self
     */
    withMethod(method: DataCallMethod): DataActionPayload {
        this.method = method;
        return this;
    }

    /**
     * @description Provide Extra Action Config & implement url extra Url Extension or FullNewPath
     * @param action DataExtraAction
     * @returns Self
     */
    withExtraAction(action: DataExtraAction): DataActionPayload {
        this.url = {
            ...this.url,
            extraUrl: action.extraUrl,
        };
        this.method = action.method;
        return this;
    }

    /**
     * @description Provide QueryParams for GET LIST
     * @param queryParams QueryParams
     * @returns Self
     */
    withQueryParams(queryParams: DataQueryParams): DataActionPayload {
        this.requestBag = { ...this.requestBag, queryParams };
        return this;
    }

    /**
     * @description Provide request Bag
     * @param data BaseActionRequestBag
     * @returns Self
     */
    withRequest(data: BaseActionRequestBag): DataActionPayload {
        this.requestBag = { ...this.requestBag, ...data };
        return this;
    }

    /**
     * @description Provide EndPoint Variables
     * @param variables DataParams
     * @returns Self
     */
    withEndPointVariables(variables: DataParams<string>): DataActionPayload {
        this.url = {
            ...this.url,
            variables,
        };
        return this;
    }

    /**
     * @description Provide Response of API
     * @param response any
     * @param success boolean
     * @returns Self
     */
    withResponse(response: any, success: boolean): DataActionPayload {
        if (success) {
            // Check if this is Infinite scroll
            if (
                'items' in response &&
                Array.isArray(this.requestBag.response)
            ) {
                // Merge previous items with new items in new response
                this.response = new DataResponse(
                    [...response?.items, ...this.requestBag.response],
                    response.metadata,
                );
            } else {
                // Normal Request
                this.response = response;
            }
            this.status = 'Success';
        } else {
            this.error = response;
            this.status = 'Failure';
        }
        // Delete Method to avoid DataEffect catching this action
        delete this.method;
        return this;
    }

    /**
     * @description Provide Flag for reducer to manage how to deal with response
     * @param flag ReducerFlag
     * @returns Self
     */
    reducerAs(flag: ReducerFlag): DataActionPayload {
        this.reducerFlag = flag;
        return this;
    }

    /**
     * @description To Call Last to finalize action and fix URL
     * @returns Self
     */
    fire(): DataActionPayload {
        if (this.method) {
            this.callUrl = this.getUrl();
        }
        this.type = generateActionType(
            this.id,
            this.entityId,
            this.endPointId,
            this.status,
        );
        return this;
    }

    /**
     * @description Get Actual & Complete URL which will be called by API
     * @returns URL as string
     */
    getUrl(): string {
        let url = this.url.base;
        const variables = this.url.variables;
        const extraUrl = this.url.extraUrl;
        if (extraUrl || !ReducerFlagMethod[this.id]) {
            if (extraUrl) {
                if (extraUrl.indexOf('/') === 0) {
                    url = extraUrl.substring(1);
                } else {
                    url += `/${extraUrl}`;
                }
            }
        } else {
            url += this.requestBag.itemId ? `/${this.requestBag.itemId}` : '';
        }
        if (!variables) {
            return url;
        }
        return url
            .split('/')
            .map((element) => {
                // Search for endpoint variables and replace with it's value
                const exists =
                    variables[element.substring(1, element.length - 1)];
                return exists ?? element;
            })
            .join('/');
    }
}
