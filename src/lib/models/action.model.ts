import { ActionCreator } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { OnReducer, ReducerTypes } from '@ngrx/store/src/reducer_creator';
import { generateActionType } from '../helper';
import { DataCallMethod, DataNaming } from './config.model';
import { DataParams, DataQueryParams } from './query-params.model';
import { BaseState } from './state.model';

/**
 * @description Action Url
 * @property {string} base
 * @property {string} extraUrl - Optional
 * @property {DataParams{string}} variables - Optional
 */
export interface DataBaseActionURL {
    base: string;
    extraUrl?: string;
    variables?: DataParams<string>;
}

/**
 * @description Request Bag Carries Body, QueryParams and etc.
 * @property itemId - Optional | string
 * @property item - Optional | extends IDataResponseEntity
 * @property body - Optional | DataParams {any}
 * @property itemsIds - Optional | string
 * @property items - Optional | Array of extends IDataResponseEntity
 * @property queryParams - Optional | DataQueryParams
 * @property onSuccessChanges - Optional | DataParams<any>
 */
export interface BaseActionRequestBag extends Record<string, any> {
    /**
     * @optional
     * @for Request/Response
     * @description Current Operation Item {Id}
     */
    itemId?: string;

    /**
     * @optional
     * @for Request
     * @description Current Operation body
     */
    body?: DataParams<any>;

    /**
     * @optional
     * @for Request/Response
     * @description Current Operation Items {Ids}
     */
    itemsIds?: string[];

    /**
     * @optional
     * @for Response
     */
    onSuccessChanges?: DataParams<any>;

    /**
     * @optional
     * @for Request
     */
    queryParams?: DataQueryParams;

    /**
     * @optional
     * @for Response
     */
    totalCount?: number;
}

export interface DataActions {
    [key: string]: ActionCreator<
        string,
        (props?: DataAction) => DataAction & TypedAction<string>
    >;
}

export interface IReducerFlag {
    // One Item
    getOne: string;
    setOne: string;
    addOne: string;
    updateOne: string;
    removeOne: string;

    // Many / List
    getMany: string;
    setMany: string;
    addMany: string;
    updateMany: string;
    removeMany: string;
}

/**
 * @description Flag for Reducer to take an action due to this flag
 */
export enum ReducerFlag {
    // One
    /**
     * @method NoMethod
     * @description Get from Store as Cached
     */
    GET_ONE = 'getOne',

    /**
     * @method GET
     * @description Get from API Direct Ignoring Cached if exists
     */
    SET_ONE = 'setOne',

    /**
     * @method POST
     * @description Create One
     */
    ADD_ONE = 'addOne',

    /**
     * @method PUT
     */
    UPDATE_ONE = 'updateOne',

    /**
     * @method DELETE
     */
    REMOVE_ONE = 'removeOne',

    /**
     * @method NoMethod
     * @description Get Many/List If already exists in store
     */

    GET_MANY = 'getMany',

    /**
     * @method GET
     * @description Get Many/List from API Direct Ignoring Cached if exists
     */
    SET_MANY = 'setMany',

    /**
     * @method POST
     * @description Create Many
     */
    ADD_MANY = 'addMany',

    /**
     * @method PUT
     */
    UPDATE_MANY = 'updateMany',

    /**
     * @method DELETE
     */
    REMOVE_MANY = 'removeMany',
}

/**
 * @description Define relation between [ReducerFlag] & [DataCallMethod]
 * @param getOne  null - No Calling Method already exists in store
 * @param setOne GET
 * @param addOne POST
 * @param updateOne PUT
 * @param removeOne DELETE
 *
 * @param getMany null - No Calling Method already exists in store
 * @param setMany GET
 * @param addMany POST
 * @param updateMany PUT
 * @param removeMany DELETE
 */
export const ReducerFlagMethod: Record<ReducerFlag, DataCallMethod> = {
    getOne: null,
    setOne: DataCallMethod.GET,
    addOne: DataCallMethod.POST,
    updateOne: DataCallMethod.PUT,
    removeOne: DataCallMethod.DELETE,

    getMany: null,
    setMany: DataCallMethod.GET,
    addMany: DataCallMethod.POST,
    updateMany: DataCallMethod.PUT,
    removeMany: DataCallMethod.DELETE,
};

export interface DataAction {
    id: string;
    entityId: string;
    endPointId: string;

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
}

export interface ActionListener {
    id: string;
    naming: DataNaming;
    success: boolean;
    onSuccessMessage?: string;
    errorMessage?: string[];
}

export const REGISTERED_ACTION_TYPES = {};
export function createAction(type: string, config) {
    REGISTERED_ACTION_TYPES[type] = (REGISTERED_ACTION_TYPES[type] || 0) + 1;
    if (typeof config === 'function') {
        return defineType(type, (...args) =>
            Object.assign(Object.assign({}, config(...args)), { type }),
        );
    }
    const as = config ? config._as : 'empty';
    switch (as) {
        case 'empty':
            return defineType(type, () => ({ type }));
        case 'props':
            return defineType(type, (props) => Object.assign({ type }, props));
        default:
            throw new Error('Unexpected config.');
    }
}
export function props() {
    return { _as: 'props', _p: undefined };
}
function defineType(type: string, creator: any) {
    return Object.defineProperty(creator, 'type', {
        value: type,
        writable: true,
    });
}

export function on(
    relatedTypes: DataParams<string>[],
    reducer: OnReducer<BaseState, ActionCreator[]>,
): ReducerTypes<BaseState, ActionCreator[]> {
    const types = relatedTypes.map((type) => {
        return generateActionType(
            type.id,
            type.entityId,
            type.endPointId,
            type.status,
        );
    });
    return { reducer, types } as ReducerTypes<BaseState, any[]>;
}
