import { DataResponse } from '../../src/lib';

describe('DataResponse', () => {
    let queryResults: DataResponse;
    const items: any[] = [{ id: 'x' }, { id: 'y' }, { id: 'z' }];

    it('Construct [Empty]', () => {
        queryResults = new DataResponse();
        expect(queryResults).toBeTruthy();
        expect(queryResults.items).toEqual([]);
        expect(queryResults.totalCount).toEqual(0);
    });

    it('Construct [With Items]', () => {
        queryResults = new DataResponse(items);
        expect(queryResults.items).toEqual(items);
        expect(queryResults.totalCount).toEqual(3);
    });

    it('Construct [With Items & totalCount]', () => {
        queryResults = new DataResponse(items, { totalCount: 100 });
        expect(queryResults.totalCount).toEqual(100);

        queryResults = new DataResponse(items, { total: 90 });
        expect(queryResults.totalCount).toEqual(90);

        queryResults = new DataResponse(items, { any_total_random: 80 });
        expect(queryResults.totalCount).toEqual(80);
    });
});
