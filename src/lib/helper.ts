import { DataQueryParams, QueryState } from './models';
import { DataActionPayload } from './core';

/**
 * @description Check if QueryParams is exists in history[]
 * @param history QueryState[]
 * @param params QueryParams
 * @returns QueryState | null
 */
export function queryParamsExists(
    history: QueryState[],
    params: DataQueryParams,
): QueryState {
    const index = (history ?? [])
        .filter((state: QueryState) =>
            state.expireTime ? new Date().getTime() < state.expireTime : true,
        )
        .map((state: QueryState) => state.params)
        .findIndex((query: DataQueryParams) => {
            return isMatched(params, query);
        });
    return index !== -1 ? history[index] : null;
}

/**
 * @description Compare any (2-any) is Matched
 * @param any1 any
 * @param any2 any
 * @returns boolean
 */
export function isMatched(any1: any, any2: any): boolean {
    if (Array.isArray(any1) && Array.isArray(any2)) {
        return isArraysMatched(any1, any2);
    }
    if (any1 instanceof Date && any2 instanceof Date) {
        return any1.getTime() === any2.getTime();
    }
    if (typeof any1 === 'object' || typeof any2 === 'object') {
        return isObjectsMatched(any1 ?? {}, any2 ?? {});
    }
    return any1 === any2 ?? any1?.length === any2?.length;
}

/**
 * @description Compare any (2-objects) is Matched
 * @param obj1 Object
 * @param obj2 Object
 * @returns boolean
 */
export function isObjectsMatched(obj1: any, obj2: any): boolean {
    let notMatch = 0;
    [Object.keys(obj1), Object.keys(obj2)].forEach((keys) => {
        notMatch += keys.filter(
            (key) => !isMatched(obj1[key], obj2[key]),
        ).length;
    });
    return notMatch === 0;
}

/**
 * @description Compare any (2-arrays) is Matched
 * @param arr1 any[]
 * @param arr2 any[]
 * @returns boolean
 */
export function isArraysMatched(arr1: any[], arr2: any[]): boolean {
    let match = 0;
    const keysLength = arr1.length;
    if (arr1?.length === arr2?.length) {
        arr1.forEach((el1) => {
            arr2.forEach((el2) => {
                match += isMatched(el1, el2) ? 1 : 0;
            });
        });
    }
    return match === keysLength;
}

export function generateActionType(
    id: string,
    entityId: string,
    endPointId: string,
    status = 'Request',
): string {
    return `[Data] ${entityId[0].toUpperCase() + entityId.substr(1)} ${
        endPointId[0].toUpperCase() + endPointId.substr(1)
    } ${id[0].toUpperCase() + id.substr(1)} ${status}`;
}

/**
 * @description Apply Filter instead of [ofType]
 * @param payload DataActionPayload
 * @returns boolean
 */
export function dataActionsFilter(
    payload: DataActionPayload,
    comparable?: {
        entityId: string;
        endPointId: string;
    },
): boolean {
    if (
        payload.type.includes('[Data]') &&
        !!payload.id &&
        !!payload.entityId &&
        !!payload.endPointId
    ) {
        return comparable
            ? payload.entityId === comparable.entityId &&
                  payload.endPointId === comparable.endPointId
            : true;
    }
    return false;
}

/**
 * @description Convert each underscores found in a string into spaces
 * @param value String
 * @returns String
 */
export function replaceUnderscores(value: string): string {
    return value.replace(/_/g, ' ');
}

/**
 * @description UpperCase only First Letter found in a string
 * also optional convert underscores into spaces
 * @param value String
 * @param replace_underscores Optional | Boolean | Default: true
 * @returns String
 */
export function upperCaseFirstLetterOnly(
    value: string,
    replace_underscores = true,
): string {
    const processed = replace_underscores ? replaceUnderscores(value) : value;
    return processed?.[0]?.toUpperCase() + processed?.substr(1);
}

/**
 * @description LowerCase only First Letter found in a string
 * also optional convert underscores into spaces
 * @param value String
 * @param replace_underscores Optional | Boolean | Default: true
 * @returns String
 */
export function lowerCaseFirstLetterOnly(
    value: string,
    replace_underscores = true,
): string {
    const processed = replace_underscores ? replaceUnderscores(value) : value;
    return processed?.[0]?.toLowerCase() + processed?.substr(1);
}

/**
 * @description UpperCase each First Letter found in a string and convert underscores into spaces
 * @param value String
 * @returns String
 */
export function upperCaseFirstLetters(value: string): string {
    return replaceUnderscores(value)
        .split(' ')
        .map((word: string) => word?.[0]?.toUpperCase() + word?.substr(1))
        .join(' ');
}

/**
 * @description CamelCase each word found in a string and replace underscores into spaces
 * with optional upperCase First Letter
 * @param value String
 * @param upperCaseFirstLetter Optional | Boolean | Default: false
 * @returns String
 */
export function toCamelCase(
    value: string,
    upperCaseFirstLetter = false,
): string {
    const processed = upperCaseFirstLetters(value).split(' ').join('');
    return upperCaseFirstLetter
        ? processed
        : lowerCaseFirstLetterOnly(processed);
}
