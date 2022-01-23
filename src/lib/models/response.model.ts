import { IMetadata } from '../dto';
import { DataParams } from './query-params.model';

/**
 * @description Arrange Api Response in [List GET] case
 * @property { any[] } items
 * @property { IMetadata } metadata
 * @property { number } totalCount
 */
export class DataResponse implements DataParams<any> {
    public totalCount: number;

    /**
     * @description Arrange Api Response in [List GET] case
     * @param items any[]
     * @param metadata Optional | IMetadata
     */
    constructor(public items: any[] = [], public metadata?: IMetadata) {
        const totalKey: string = metadata
            ? Object.keys(metadata).find((key) => key === 'total') ??
              Object.keys(metadata).find((key) => key.search('total') !== -1)
            : null;
        if (totalKey) {
            this.totalCount = this.metadata[totalKey] ?? items.length;
        } else {
            this.metadata = {
                total: items?.length,
            };
            this.totalCount = items.length;
        }
    }
}
