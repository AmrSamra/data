import { DataParams } from '../models';

/**
 * @description use for return one Item
 * @property {any} data
 */
export interface IResponseDto<T extends any> {
    data: T;
}

/**
 * @description use for list response metadata
 * @property {any} [key: string]
 */
export interface IMetadata extends DataParams<any> {
    [key: string]: any;
}

/**
 * @description use for return list of items
 * @property {IMetadata} [key: string]
 */
export interface IResponseItemsDto<T extends any> extends IResponseDto<T[]> {
    [key: string]: IMetadata;
}
