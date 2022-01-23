import {
    DataActionPayload,
    BaseActionRequestBag,
    DataCallMethod,
    DataQueryParams,
    ReducerFlag,
    ReducerFlagMethod,
} from '../src/lib';

describe('DataActionPayload', () => {
    jest.autoMockOn();
    const entityId = 'ENTITY_ID';
    const endPointId = 'END_POINT_ID';
    let payload: DataActionPayload;

    it('Constructor', () => {
        for (const flag in ReducerFlag) {
            payload = new DataActionPayload(flag, entityId, endPointId);
            expect(payload).toBeTruthy();
            expect(payload.method).toEqual(ReducerFlagMethod[flag]);
        }
    });

    let flag: ReducerFlag;
    const queryParams = new DataQueryParams();
    const requestBag: BaseActionRequestBag = {
        itemId: 'ITEM_ID',
        queryParams,
        body: {
            status: 'CANCEL',
        },
    };
    const response = {
        id: 'ITEM_ID',
        name: 'ITEM_NAME',
    };

    beforeEach(() => {
        flag = ReducerFlag.SET_ONE;
        payload = new DataActionPayload(flag, entityId, endPointId);
    });

    it('withUrl using Extension', () => {
        payload = payload
            .withUrl('path/{id}/url', 'extension', { id: 'ITEM_ID' })
            .fire();

        expect(payload.url).toEqual({
            base: 'path/{id}/url',
            extraUrl: 'extension',
            variables: { id: 'ITEM_ID' },
        });
        expect(payload.callUrl).toBe('path/ITEM_ID/url/extension');
    });

    it('withUrl using Full Url Replacing', () => {
        payload = payload
            .withUrl('path/{id}/url', '/new/url/{var}/full/path', {
                var: 'VARIABLE',
            })
            .fire();

        expect(payload.url).toEqual({
            base: 'path/{id}/url',
            extraUrl: '/new/url/{var}/full/path',
            variables: { var: 'VARIABLE' },
        });
        expect(payload.callUrl).toBe('new/url/VARIABLE/full/path');
    });

    it('withMethod', () => {
        payload = payload.withMethod(DataCallMethod.GET);

        expect(payload.method).toBe('GET');
    });

    it('withExtraAction', () => {
        payload = new DataActionPayload(
            'EXTRA_ACTION_ID',
            entityId,
            endPointId,
        );
        expect(payload.method).toBeUndefined();
        payload = payload
            .withUrl('url')
            .withExtraAction({
                method: DataCallMethod.PUT,
                extraUrl: 'extension',
            })
            .fire();
        expect(payload.method).toBe('PUT');
        expect(payload.callUrl).toBe('url/extension');
    });

    it('withQueryParams', () => {
        payload = payload.withQueryParams(queryParams);

        expect(payload.requestBag.queryParams).toEqual(queryParams);
    });

    it('withQueryParams', () => {
        payload = payload.withRequest(requestBag);

        expect(payload.requestBag.queryParams).toEqual(queryParams);
        expect(payload.requestBag.itemId).toBe('ITEM_ID');
        expect(payload.requestBag.body).toEqual({ status: 'CANCEL' });
    });

    it('withEndPointVariables & getUrl', () => {
        payload = payload
            .withUrl('path/{id}/url', 'extra/{variable}/go')
            .withEndPointVariables({
                id: 'ITEM_ID',
                variable: 'VARIABLE',
            })
            .fire();

        expect(payload.url).toEqual({
            base: 'path/{id}/url',
            extraUrl: 'extra/{variable}/go',
            variables: { id: 'ITEM_ID', variable: 'VARIABLE' },
        });
        expect(payload.callUrl).toBe('path/ITEM_ID/url/extra/VARIABLE/go');
    });

    it('withResponse [Success]', () => {
        payload = payload.withResponse(response, true);
        expect(payload.response).toEqual(response);
        expect(payload.method).toBeUndefined();
        expect(payload.status).toBe('Success');
    });

    it('withResponse Cumulative  [Success]', () => {
        const cum = {
            id: 'C_ITEM_ID',
            name: 'C_ITEM_NAME',
        };
        payload = payload
            .withRequest({
                ...requestBag,
                response: [cum],
            })
            .withResponse(
                {
                    items: [response],
                },
                true,
            );
        expect(payload.response).toEqual({
            items: [response, cum],
            metadata: {
                total: 2,
            },
            totalCount: 2,
        });
        expect(payload.method).toBeUndefined();
        expect(payload.status).toBe('Success');
    });

    it('withResponse [Failure]', () => {
        payload = payload.withResponse(response, false);
        expect(payload.error).toEqual(response);
        expect(payload.method).toBeUndefined();
        expect(payload.status).toBe('Failure');
    });

    it('reducerAs', () => {
        expect(payload.reducerFlag).toBeUndefined();
        payload = payload.reducerAs(flag);
        expect(payload.reducerFlag).toBe('setOne');
    });

    it('Response', () => {
        payload = payload.reducerAs(flag).withRequest(requestBag);
        const respond = DataActionPayload.respond(payload, response, true);
        expect(respond.reducerFlag).toBe('setOne');
        expect(respond.requestBag).toEqual(requestBag);
        expect(respond.response).toEqual(response);
        expect(respond.status).toBe('Success');
    });

    it('Response with OnSuccessChanges', () => {
        payload = payload.reducerAs(flag).withRequest({
            ...requestBag,
            onSuccessChanges: {
                status: 'OPEN',
            },
        });
        const respond = DataActionPayload.respond(payload, response, true);
        expect(respond.response).toEqual({
            status: 'OPEN',
        });
    });
});
