import { DataNaming } from '../../src/lib';

describe('ConfigModel', () => {
    let naming: DataNaming;

    it('Data Naming Singular Only', () => {
        naming = new DataNaming('name');
        expect(naming.singular).toBe('Name');
        expect(naming.plural).toBe('Names');
    });

    it('Data Naming Singular & Plural', () => {
        naming = new DataNaming('country', 'countries');
        expect(naming.singular).toBe('Country');
        expect(naming.plural).toBe('Countries');
    });
});
