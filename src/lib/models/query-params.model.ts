export interface DataParams<T extends any> {
    [key: string]: T;
}

/**
 * @description Prepare and arrange query params
 * @property {string} [key: string]
 * @method send() returns DataParams<any>
 */
export class DataQueryParams implements DataParams<any> {
    /**
     * @description Prepare and arrange query params
     * @param params DataParams<any>
     */
    constructor(params: DataParams<any> = {}) {
        for (const key in params) {
            this[key] = params[key];
        }
    }

    /**
     * @description copy Params in isolated object without flag
     * @returns DataParams<any>
     */
    send(): DataParams<any> {
        const current = Object.assign({}, this);
        delete current['flag'];
        return current;
    }
}
