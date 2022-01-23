# SLVI-DM

## SLVI Data Management

Many applications have substantial domain models with 10s or 100s of entity types.

Such applications typically create, retrieve, update, and delete entity data that are "persisted" in a database of some sort, hosted on a remote server.

Developers who build these apps with the NgRx Store, Effects, and Entity libraries alone tend to write a large number of actions, action-creators, reducers, effects, dispatchers, and selectors as well as the HTTP GET, PUT, POST, and DELETE methods for each entity type. There will be a lot of repetitive code to create, maintain, and test. The more entities in your model, the bigger the challenge.

With SLVI/Data you can develop large entity models quickly with very little code and without knowing much NgRx at all. Yet all of NgRx remains accessible to you, when and if you want it.

SLVI/Data is an abstraction over the Store, Effects, and Entity that radically reduces the amount of code you'll write. As with any abstraction, while you gain simplicity, you lose the explicitness of direct interaction with the supporting NgRx libraries.

This library was generated with [Nx](https://nx.dev).

## Installation

1.  Create your `DATA_CONFIG` implements `DataConfig` interface in separate file and define your entities ids, endPoints Ids and extra actions as much as you need follow code example.

    ```ts
    import { DataConfig, DataNaming } from '@slvi/data';
    ...
    export const dataConfig: DataConfig = {
        `ENTITY_ID`: {
            endPoints: {
                default: {
                    url: 'path/to/default/{variable}/url',
                },
                `ENDPOINT_ID`: {
                    url: 'path/to/endpoint/{variable}/url',
                },
            },
            // Optional | Integer >= 0 | Default is '0' unlimited validation.
            // Define how many minutes you want to keep history valid.
            validWithIn: 10,
            // Optional | Default: {singular: 'ENTITY_ID', plural: 'ENTITY_ID + s'}
            naming: new DataNaming('entity', 'entities'),
        },
    };
    ```

2.  Import `DataModule` in your module for example `AppModule` and pass your config file through `forRoot()`.
3.  Pass your notification handler service by Providing `DataUtils` in your module providers using your custom existing service which must `extends` `DataUtils` .
    ```ts
    import { NgModule } from '@angular/core';
    import { DataModule, DataUtils } from '@slvi/data';
    import { DATA_CONFIG, YourCustomLayoutUtilsService } from 'your/custom/path';
    ...
    @NgModule({
        ...
        imports: [
            // Your Exist Imported Modules
            StoreModule.forRoot(...),
            EffectsModule.forRoot([...]),
            ...,
            ...,
            ...,
            // Keep Last (Recommended)
            DataModule.forRoot(DATA_CONFIG),
        ],
        providers: [
            ...,
            { provide: DataUtils, useExisting: YourCustomLayoutUtilsService },
            ...
        ],
        ...
    })
    ```

## Setup

### Default setup (Component Level)

1.  Inject `DataSandBoxFactory` in your component `constructor()`.
2.  Ask your factory to create your sandBox immediately in `constructor` or `ngOnInit` not both then follow
    this code example.

-   once you finished, you already got your sandBox and you can call any function as much as you need.

    ```ts
    import { DataSandBoxFactory, DataSandBoxService } from '@slvi/data';
    ...
    export class Component {
        ...
        sandBox: DataSandBoxService; // Define sandBox Variable in Component
        ...
        constructor(
            ...
            private factory: DataSandBoxFactory, // Factory Injection
            ...
        ) {
            // Here
            this.sandBox = this.factory.create('ENTITY_ID', 'ENDPOINT_ID');
        }

        ngOnInit(): void {
            // Or Here
            this.sandBox = this.factory.create('ENTITY_ID', 'ENDPOINT_ID');
        }
    }
    ```

### Advanced setup (SandBox Level - For More control)

1.  Create your own `@Injectable() CustomSandBox` extends `DataSandBoxService` to inherit everything.
2.  You have to pass `YOUR_ENTITY_ID` & `YOUR_END_POINT_ID` in the constructor `super()`.
3.  Inject your `CustomSandBox` in your component `constructor()`.

-   Start using it normally same as default or implement your custom methods.

    ```ts
    import { DataSandBoxService } from '@slvi/data';
    ...
    export class CustomSandBox extends DataSandBoxService {
        constructor() {
            super('ENTITY_ID', 'ENDPOINT_ID');
        }
    }
    ```

    ```ts
    export class Component {
        constructor(
        ...
        private sandBox: CustomSandBox,
        ...
        ) {}
    }
    ```

## Usage

### Default Actions

#### (One-Entity / single-Item)

1.  For manipulating operations for (one-entity) use:

    ```ts
    // Body is Optional
    this.sandBox.create(BODY);
    this.sandBox.read(ITEM_ID);
    this.sandBox.update(ITEM_ID, BODY);
    this.sandBox.delete(ITEM_ID);
    ...
    // For forcing calling API ignoring cache.
    this.sandBox.readForced(ITEM_ID);
    ```

-   Subscribe `item$` property in `sandBox` to get current item in store or simply use
    `item$ | async` in your HTML.

    ```ts
    this.sandBox.item$.subscribe((item) {
        // Implement your own code
    })
    ```

-   You can trigger ActionLoading by `loading$` property in `sandBox` to get current loading action
    by `ACTION_ID`.

    ```ts
    this.sanBox.loading$.subscribe((currentlyLoadingActionId: string) => {
        // Implement your own code
    });
    ```

    OR

    ```ts
    import { ReducerFlag } from '@slvi/data';
    ...
    this.sanBox.onActionLoading('ACTION_ID')
        .subscribe((loading: boolean) => {
        // Implement your own code
    });
    // `ACTION_ID`: by default it's follow `ReducerFlag` enum
    this.sanBox.onActionLoading(ReducerFlag.SET_ONE)
        .subscribe((loading: boolean) => {
        // Implement your own code
    });
    ```

#### (List-of-Entities / Many-of-Items)

1.  For manipulating operations for (bulk/list-entities) use:

    ```ts
    // Body is Optional
    this.sandBox.createBulk(BODY);
    this.sandBox.listRead(QUERY_PARAMS);
    this.sandBox.bulkUpdate(ITEMS_IDS, BODY);
    this.sandBox.bulkDelete(ITEMS_IDS, BODY);
    ...
    // Special Case :: For Infinity scroll or follow pagination to fetch all data with max response limit
    this.sandBox.listReadInfinity(QUERY_PARAMS);
    ...
    // For forcing calling API ignoring cache
    this.sandBox.readForced(QUERY_PARAMS);
    ```

2.  You can Subscribe `items$` property in `sandBox` to get current items in store.

    ```ts
    this.sandBox.items$.subscribe((items) {
        // Implement your own code
    })
    ```

    ```html
    {{ sandBox.items$ | async }}
    ```

-   You can trigger List Loading by using `actionLoading` Indicator.

    ```ts
    import { ReducerFlag } from '@slvi/data';
    ...
    this.sanBox.onActionLoading(ReducerFlag.SET_MANY).subscribe((loading: boolean) => {
        // Implement your own code
    });
    ```

    -   You can trigger any Action Loading by `onActionLoading('ACTION_ID')` method in `sanBox`
        to get action loading as `boolean`.

    ```ts
    import { ReducerFlag } from '@slvi/data';
    ...
    this.sanBox.onActionLoading('ACTION_ID')
        .subscribe((loading: boolean) => {
        // Implement your own code
    });
    // `ACTION_ID`: by default it's follow `ReducerFlag` enum
    this.sanBox.onActionLoading(ReducerFlag.SET_ONE)
        .subscribe((loading: boolean) => {
        // Implement your own code
    });
    ```

### Casting / Mapping / Reformation (Advanced / Optional / Recommended)

-   For refactoring entity or entities to for ex. cast `DTO` to `EntityModel`.

1. In Your `CustomSandBox` override `mapping()` method.

    ```ts
    import { DataSandBoxService } from '@slvi/data';
    ...
    export class CustomSandBox extends DataSandBoxService {
        constructor() {
            super('ENTITY_ID', 'ENDPOINT_ID');
        }

        mapping(dto: ICustomResponseDto): CustomEntity {
            // Implement You Own Reformation Code
            return CustomEntity.castFromDto(dto);
        }
    }
    ```

### Extra Actions (Advanced)

1.  For Extra Actions you already defined in your `DATA_CONFIG` file.

    ```ts
    import { DataConfig, DataCallMethod } from '@slvi/data';
    ...
    const DATA_CONFIG: DataConfig = {
       'ENTITY_ID': {
           endPoints: {
               'ENDPOINT_ID': {
                   url: 'path/url',
                   extraActions: {
                       'EXTRA_ACTION_ID': {
                            method: DataCallMethod.GET // GET, PUT, POST and DELETE

                            // Optional | string, For add URL extension.
                            extraUrl: '{variable}/extra/path',
                            // URL = 'path/url' + '{variable}/extra/path'

                            // Optional | string, Start with '/', for full URL replacement.
                            extraUrl: '/new/full/{variable}',
                            // URL = 'new/full/url/{variable}'

                            // Optional | string
                            onSuccessMessage: 'Extra Action Executed Successfully!',
                       }
                   }
               },
           },
       },
    }
    ```

2.  using `dispatchExtraAction()` with passing `EXTRA_ACTION_ID`.

    ```ts
    this.dispatchExtraAction(
        'EXTRA_ACTION_ID', // Required
        requestBag, // Optional | Can contain params, body, queryParams or related id/s
        endPointVariables, // Optional | for endPoint {variables} replacement.
        ReducerFlag, // Optional | UPDATE_ONE, DELETE_ONE, UPDATE_MANY or DELETE_MANY
    );
    ```

-   For some `Extra Actions` you got `No Response` and you want the reducer to apply some changes
    on stored data, you can pass a `Response Simulation` only on success phase by:

    ```ts
    import {BaseActionRequestBag} from '@slvi/data';
    ...
    const requestBag: BaseActionRequestBag = {
        ITEM_ID, // Required On [ UpdateOne or DeleteOne ]
        ITEMS_IDS, // Required On [ UpdateMany or DeleteMany ]
        body: {
            //...
        }
        // Optional
        onSuccessChanges: {
            status: 'CANCEL',
            attachments: [...],
        }
    };
    ```

-   Trigger Extra Action Loading By:

    ```ts
    this.sanBox
        .onExtraActionLoading('EXTRA_ACTION_ID')
        .subscribe((loading: boolean) => {
            // Implement your own code
        });
    ```

### Subscribe Custom Selector (Advanced)

1.  You can subscribe any selector by using function `select(...)`
    passing ( `selector key` follows `BaseSelector` ) as `string`.

    ```ts
    this.sandBox.select('SELECTOR_NAME');
    ```

### Infinity Loading (Infinite Scroll / Fetch all data following pagination)

1.  You make results to be cumulated in same store and cache them in same time

    ```ts
    // On You Custom Event
    this.yourCustomEvent
        .pipe(
            withLatestFrom(
                this.sandBox.nextInfinitePageIndex(
                    50, // Max Results Limit Per Single Request
                    0, // Start Index Count | Optional | Default = 0
                ),
            ),
        )
        .subscribe((event: Event, nextIndex: number) => {
            this.listReadInfinity(
                new DataQueryParams({ page_index: nextIndex }),
            );
        });
    ```

    ```ts
    // On Previous Request Complete
    this.sandBox.nextInfinitePageIndex(50).subscribe((nextIndex: number) => {
        this.listReadInfinity(new DataQueryParams({ page_index: nextIndex }));
    });
    ```

2.  It will do every thing for your, (`loading`, `caching`, `return`)

### EndPointVariables

-   Each Url has some variables for ex. {organizationId} , {assetId} or {entityId}.
-   There is way to replace their values by passing an object called [`endPointVariables`]
    on the fly through the action dispatching in `dispatchExtraAction(...)`.

### Direct API Calling Bypass Ngrx Store

-   You can call API directly with specific url without implementing any additional services.

1. Inject API service `ApiCallService` in your `CustomSandBox` , `constructor()` and feel free to call API with [GET, PUT, POST, DELETE] Methods.

    ```ts
    import { DataSandBoxService, ApiCallService } from '@slvi/data';
    ...
    export class CustomSandBox extends DataSandBoxService {
        constructor(
            ...
            private apiCallService: ApiCallService,
            ...
        ) {
            super(ENTITY_ID, ENDPOINT_ID);
        }
    }
    ```

-   [ OR ] Inject API service `ApiCallService` in your `CustomComponent` , `constructor()` and feel free to call API with [GET, PUT, POST, DELETE] Methods.

    ```ts
    import { ApiCallService } from '@slvi/data';
    ...
    export class CustomComponent extends OnInit {
        constructor(
        ...
        private apiCallService: ApiCallService,
        ...
        ) {}
    }
    ```

2. How to Call.

    ```ts
    let request: Observable<any>;
    // GET
    request = apiCallService.GET(
        'URL', // Required | {string}
        params, // Optional | DataParams{string}
    );
    // PUT
    request = apiCallService.PUT(
        'URL', // Required | {string}
        body, // Optional | DataParams{any}
    );
    // POST
    request = apiCallService.POST(
        'URL', // Required | {string}
        body, // Optional | DataParams{any}
    );
    // DELETE
    request = apiCallService.DELETE(
        'URL', // Required | {string}
        body, // Optional | DataParams{any}
    );

    // You have to subscribe the request Observable
    request.pipe(first()).subscribe((response: any) => {
        // Implement your own code
    });
    ```

### AfterActionSuccess for ex. (Redirection)

1. For Base `ReducerFlag` actions [`addOne` , `updateOne` , `addMany` , `updateMany`]

    ```ts
    this.sandBox.onActionSuccess('ACTION_ID').subscribe((response: any) => {
        // Implement your own code or you can redirect also
        this.router.navigate(['path', response.id]);
    });
    ```

2. For `ExtraActions` ids as `EXTRA_ACTION_ID`
    ```ts
    this.sandBox
        .onExtraActionSuccess('EXTRA_ACTION_ID')
        .subscribe((response: any) => {
            // Implement your own code or you can redirect also
            this.router.navigate(['path', response.id]);
        });
    ```

### Date Transfer Object (DTO) - Response Structure

-   SLVI/Data follow [{JSON:API}](https://jsonapi.org/format/)

1. Default response has to match `IResponseDto` that contains `data` Object of `any`.
    ```ts
    export interface IResponseDto {
        ...
        ...
        ...
        data: object | any;
    }
    ```
1. Lists response has to match `IResponseItemsDto` that contains ( `data` Object of `any[]` ) and ( `metadata` Object of `IMetadata` ).

    ```ts
    export interface IResponseItemsDto {
        ...
        ...
        ...
        data: object[] | any[];
        // At least have one property for pagination metadata
        // key naming has to contain 'meta' string and value of type 'IMetadata'
        // For example 'metadata', '_metadata', 'meta' or etc...
        metadata: IMetadata;
    }
    ```

    ```ts
    export interface IMetadata {
        ...
        ...
        ...
        // At least have one property for total count items
        // key naming has to contain 'total' string and value of type 'number'
        // For example 'totalCount', '_total', 'total' or etc...
        total: number;
    }
    ```

1. Extra actions response can be any structure of what you want, but If you want reducer to know what's happening via ReducerFlag, you must match previous two DTOs.

## Running unit tests

-   Run `nx test data` to execute the unit tests.
