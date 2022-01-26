import { Injectable, InjectionToken, Injector } from '@angular/core';
import { DataConfigService } from './data-config.service';
import { DataSandBoxService } from './data.service';
import { DataCallMethod } from './models';

@Injectable()
export class DataSandBoxFactory {
    constructor(
        public configMG: DataConfigService,
        public injector: Injector,
    ) {}

    /**
     * @description Create with [ LOVE <3 ] The Default DataSandBox to save your Valuable Time :)
     * @param entityId string
     * @param endPointId string | 'default'
     * @returns DataSandBoxService
     */
    create(entityId: string, endPointId = 'default'): DataSandBoxService {
        const config = this.configMG.getConfigByIdentifier(
            entityId,
            endPointId,
        );
        if (!config || !config.entityConfig || !config.endPointConfig) {
            throw new Error(
                `Config Entity [${entityId}] with identifier [${endPointId}] can not be found in configuration`,
            );
        }

        if (!config.endPointConfig.url) {
            throw new Error(
                `Config Entity [${entityId}] with identifier [${endPointId}] has not valid endPoint URL`,
            );
        }

        const extraActions = config.endPointConfig.extraActions;
        if (extraActions) {
            Object.keys(extraActions).forEach((actionId: string) => {
                if (
                    !(extraActions[actionId].method in DataCallMethod) ||
                    !extraActions[actionId].extraUrl
                ) {
                    throw new Error(
                        `Config Entity [${entityId}] with identifier [${endPointId}], has invalid configuration for Extra Action ID [${actionId}]`,
                    );
                }
            });
        }

        return this.injector.get<DataSandBoxService>(
            new InjectionToken<DataSandBoxService>(
                `SandBox_${entityId}_${endPointId}`,
                {
                    factory() {
                        return new DataSandBoxService(entityId, endPointId);
                    },
                },
            ),
        );
    }
}
