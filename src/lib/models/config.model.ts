/**
 * @description Data API Call Method
 * @enum {string} GET, PUT, POST, DELETE
 */
export enum DataCallMethod {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    DELETE = 'DELETE',
}

/**
 * @description Define naming which will be returned in notification message
 * @property {string} singular
 * @property {string} plural
 */
export class DataNaming {
    public singular: string;
    public plural: string;

    /**
     * @param _singular string
     * @param _plural string | Optional
     */
    constructor(_singular: string, _plural?: string) {
        const plural = _plural ?? `${_singular}s`;

        this.singular = _singular[0].toUpperCase() + _singular.substring(1);
        this.plural = plural[0].toUpperCase() + plural.substring(1);
    }
}

/**
 * @description Define extra actions by it's unique (id) with API Call Method from CRUD Actions
 */
export interface DataExtraAction {
    method: DataCallMethod;
    extraUrl: string;
    onSuccessMessage?: string;
}
/**
 * @description Global Data Config and define all entities with it's endpoints
 * @property {DataConfigEntity} entityId
 */
export interface DataConfig extends Record<string, DataConfigEntity> {
    [key: string]: DataConfigEntity;
}

/**
 * @description Entity Data Config and define only single entity
 * @property {DataConfigEndPoints} endPoints
 * @property {DataNaming} naming
 * @property {number} validWithIn
 */
export interface DataConfigEntity {
    endPoints: DataConfigEndPoints;
    naming?: DataNaming;
    validWithIn?: number;
}

/**
 * @description Entity EndPoint Data Config and define only single EndPoint
 * @property {DataConfigEndPoint} default - Optional
 * @property {DataConfigEndPoint} [key: string] - Optional
 */
export interface DataConfigEndPoints
    extends Record<string, DataConfigEndPoint> {
    /**
     * @description Default End Point Configuration
     */
    default?: DataConfigEndPoint;
    [key: string]: DataConfigEndPoint;
}

/**
 * @description Define Single EndPoint Config
 * @property {string} url
 * @property {Record<string, DataExtraAction>} extraActions
 */
export interface DataConfigEndPoint {
    url: string;
    extraActions?: Record<string, DataExtraAction>;
}
