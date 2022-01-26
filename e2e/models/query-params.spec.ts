import { DataParams, DataQueryParams } from '../../src/lib';

describe('DataQueryParams', () => {
    let queryParams: DataQueryParams;
    let arranged: DataParams<any>;

    it('Default', () => {
        queryParams = new DataQueryParams({
            'filter[valid]': true,
            sortField: 'createdAt',
            pageSize: 12,
            flag: {
                id: 'ID',
                entity: 'ENTITY',
                custom: 'CUSTOM',
            },
        });

        // After Arranged
        arranged = queryParams.send();

        expect(arranged).toBeTruthy();
        expect(arranged['filter[valid]']).toEqual(true);
        expect(arranged.sortField).toBe('createdAt');
        expect(arranged.pageSize).toBe(12);
        expect(arranged.flag).toBeUndefined();
    });
});
