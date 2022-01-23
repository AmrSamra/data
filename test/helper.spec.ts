import {
    queryParamsExists,
    DataQueryParams,
    QueryState,
    isMatched,
    replaceUnderscores,
    upperCaseFirstLetters,
    toCamelCase,
    upperCaseFirstLetterOnly,
    lowerCaseFirstLetterOnly,
} from '../src/lib';
import { TEST_CONFIG } from './test.config';

describe('Helper', () => {
    jest.autoMockOn();
    let queryParams = new DataQueryParams();
    const ids = ['0', '1', '2', '3'];
    const validWithIn = TEST_CONFIG['validEntity'].validWithIn;
    const now = new Date();
    const history: QueryState[] = ids.map((i) => {
        return {
            params: new DataQueryParams({ x: i }),
            ids,
            totalCount: 0,
            expireTime: now.setMinutes(now.getMinutes() + validWithIn),
        };
    });

    it('isMatched', () => {
        expect(isMatched(['data'], ['data'])).toBeTruthy();
        expect(
            isMatched(
                {
                    data: 'data',
                    x: undefined,
                },
                {
                    data: 'data',
                    y: null,
                },
            ),
        ).toBeTruthy();
        expect(isMatched('data', 'data')).toBeTruthy();

        expect(isMatched(['data'], ['data', undefined])).toBeFalsy();
        expect(
            isMatched(
                {
                    data: 'data',
                },
                {
                    data: 'Data',
                },
            ),
        ).toBeFalsy();
        expect(
            isMatched(
                {
                    data: 'data',
                    x: undefined,
                },
                {
                    data: 'data',
                    y: 0,
                },
            ),
        ).toBeFalsy();
        expect(isMatched('data', 'Data')).toBeFalsy();

        expect(
            isMatched(['data'], {
                data: 'data',
            }),
        ).toBeFalsy();
        expect(
            isMatched(
                {
                    data: 'data',
                },
                'data',
            ),
        ).toBeFalsy();
        expect(isMatched('data', ['data'])).toBeFalsy();
    });

    it('queryParamsExists [Match]', () => {
        queryParams = new DataQueryParams({ x: '1' });
        expect(queryParamsExists(history, queryParams)).toMatchObject(
            history[1],
        );
    });

    it('queryParamsExists [Not Match]', () => {
        queryParams = new DataQueryParams({ x: '1', y: '1' });
        expect(queryParamsExists(history, queryParams)).toBeFalsy();
    });

    it('replaceUnderscore', () => {
        const valid = 'replace underscored sentences';
        const inValid = 'replace_underscored_sentences';
        expect(replaceUnderscores(valid)).toEqual(valid);
        expect(replaceUnderscores(inValid)).toEqual(valid);
    });

    it('upperCaseFirstLetterOnly', () => {
        const valid = 'Upper case first_letter only';
        const validWithUnderscoreReplace = 'Upper case first letter only';
        const inValid = 'upper case first_letter only';
        expect(upperCaseFirstLetterOnly(valid)).toEqual(
            validWithUnderscoreReplace,
        );
        expect(upperCaseFirstLetterOnly(valid, false)).toEqual(valid);
        expect(upperCaseFirstLetterOnly(inValid)).toEqual(
            validWithUnderscoreReplace,
        );
        expect(upperCaseFirstLetterOnly(inValid, false)).toEqual(valid);
    });

    it('lowerCaseFirstLetterOnly', () => {
        const valid = 'lower case first_letter only';
        const validWithUnderscoreReplace = 'lower case first letter only';
        const inValid = 'lower case first_letter only';
        expect(lowerCaseFirstLetterOnly(valid)).toEqual(
            validWithUnderscoreReplace,
        );
        expect(lowerCaseFirstLetterOnly(valid, false)).toEqual(valid);
        expect(lowerCaseFirstLetterOnly(inValid)).toEqual(
            validWithUnderscoreReplace,
        );
        expect(lowerCaseFirstLetterOnly(inValid, false)).toEqual(valid);
    });

    it('upperCaseFirstLetters', () => {
        const valid = 'Upper Case First Letters';
        const inValid = 'upper case first_letters';
        expect(upperCaseFirstLetters(valid)).toEqual(valid);
        expect(upperCaseFirstLetters(inValid)).toEqual(valid);
    });

    it('toCamelCase', () => {
        const validWithFirstUp = 'ToCamelCase';
        const validWithoutFirstUp = 'toCamelCase';
        const inValid = 'to Camel_case';
        expect(toCamelCase(validWithFirstUp, true)).toEqual(validWithFirstUp);
        expect(toCamelCase(validWithoutFirstUp)).toEqual(validWithoutFirstUp);
        expect(toCamelCase(inValid, true)).toEqual(validWithFirstUp);
        expect(toCamelCase(inValid)).toEqual(validWithoutFirstUp);
    });
});
