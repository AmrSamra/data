import {
    inject,
    InjectionToken,
    ModuleWithProviders,
    NgModule,
} from '@angular/core';
import { DataConfig, BaseState, createAction, props } from './models';
import { DataConfigService } from './data.config';
import { ApiCallService } from './core';
import { DataSelectorsGenerator } from './core/selectors.service';
import { DataEffectsService } from './core/effects.service';
import { DataReducersService } from './core/reducers.service';
import { Actions, USER_PROVIDED_EFFECTS } from '@ngrx/effects';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { DataSandBoxFactory } from './data-factory.service';
import { DATA_ACTION, DATA_CONFIG, DATA_SELECTORS } from './data.tokens';
import { DataUtils } from './data-layout-utils.service';

@NgModule({
    providers: [DataSandBoxFactory, ApiCallService],
})
export class DataModule {
    /**
     * @description Import Data Module with Providing specific Configuration
     * @param { DataConfig } configuration
     * @returns ModuleWithProviders { DataModule }
     */
    static forRoot(configuration: DataConfig): ModuleWithProviders<DataModule> {
        return {
            ngModule: DataModule,
            providers: [
                {
                    provide: DATA_CONFIG,
                    useValue: DataConfigService.arrange(configuration),
                },
                {
                    provide: DATA_ACTION,
                    useValue: createAction('[Data]', props()),
                },
                // Selectors
                {
                    provide: DATA_SELECTORS,
                    useValue: new DataSelectorsGenerator(
                        configuration,
                    ).generate(),
                },
                // Configurations
                {
                    provide: DataConfigService,
                    deps: [DATA_CONFIG, DATA_ACTION, DATA_SELECTORS],
                },
                // Effects
                {
                    provide: DataEffectsService,
                    deps: [
                        DATA_CONFIG,
                        DATA_ACTION,
                        Actions,
                        ApiCallService,
                        DataUtils,
                    ],
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [DataEffectsService],
                },
                // Reducers
                {
                    provide: DataReducersService,
                    deps: [DATA_ACTION, DATA_CONFIG],
                },
                // Data store features providers
                ...Object.keys(configuration)
                    .map((slug) => {
                        const FEATURE_REDUCER = new InjectionToken<
                            ActionReducer<BaseState>
                        >(slug + 'Feature Reducer', {
                            providedIn: DataModule,
                            factory() {
                                const dataReducers =
                                    inject(DataReducersService);
                                return dataReducers.getFeature(slug);
                            },
                        });
                        return StoreModule.forFeature(slug, FEATURE_REDUCER)
                            .providers;
                    })
                    .flat(2),
            ],
        };
    }
}
