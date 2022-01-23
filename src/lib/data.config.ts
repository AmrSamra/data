import { Inject, Injectable } from '@angular/core';
import { ActionCreator } from '@ngrx/store';
import { DATA_ACTION, DATA_SELECTORS } from './data.tokens';
import {
    BaseSelector,
    DataConfig,
    DataConfigEntity,
    DataConfigEndPoint,
    SelectorsGroup,
    DataNaming,
    DataConfigEndPoints,
    DataCallMethod,
} from './models';

export interface ConfigByIdentifier {
    entityConfig: DataConfigEntity;
    endPointConfig: DataConfigEndPoint;
    action: ActionCreator<string, any>;
    selectors: BaseSelector;
}
@Injectable()
export class DataConfigService {
    constructor(
        @Inject(String) public configurations: DataConfig,
        @Inject(DATA_ACTION) public action: ActionCreator<string, any>,
        @Inject(DATA_SELECTORS) public selectors: SelectorsGroup,
    ) {}

    static arrange(configuration: DataConfig): DataConfig {
        let entityConfig: DataConfigEntity;
        let endPoints: DataConfigEndPoints;
        const config: DataConfig = {};
        Object.keys(configuration).forEach((entityId) => {
            entityConfig = configuration[entityId];
            entityConfig.naming =
                entityConfig?.naming ?? new DataNaming(entityId);
            entityConfig.validWithIn = entityConfig?.validWithIn ?? 0;
            endPoints = entityConfig.endPoints;
            if (
                !endPoints ||
                entityConfig.validWithIn < 0 ||
                !Number.isInteger(entityConfig.validWithIn)
            ) {
                throw new Error(
                    `Config Entity [${entityId}] has invalid Configuration`,
                );
            }
            Object.keys(endPoints).forEach((endPointId) => {
                if (!endPoints[endPointId]) {
                    throw new Error(
                        `Config Entity [${entityId}] with identifier [${endPointId}] has not valid endPoint URL`,
                    );
                }
                const extraActions = endPoints[endPointId].extraActions;
                if (extraActions) {
                    Object.keys(extraActions).forEach((actionId: string) => {
                        if (
                            !(
                                extraActions[actionId].method in DataCallMethod
                            ) ||
                            [null, undefined].includes(
                                extraActions[actionId].extraUrl,
                            )
                        ) {
                            throw new Error(
                                `Config Entity [${entityId}] with identifier [${endPointId}], has invalid configuration for Extra Action ID [${actionId}]`,
                            );
                        }
                    });
                }
            });
            config[entityId] = entityConfig;
        });
        return config;
    }

    /**
     * @description Collect all Configuration you need to be provided were you are
     * @param entityId string
     * @param endPointId string | 'default'
     * @returns ConfigByIdentifier
     */
    getConfigByIdentifier(
        entityId: string,
        endPointId: string,
    ): ConfigByIdentifier {
        const entityConfig: DataConfigEntity = this.configurations[entityId];
        const endPointConfig: DataConfigEndPoint =
            entityConfig?.endPoints?.[endPointId];
        const selectors = this.selectors[entityId];
        return {
            entityConfig,
            endPointConfig,
            action: this.action,
            selectors,
        };
    }

    getConfiguration(): DataConfig {
        return this.configurations;
    }
}
