import { DataConfig, DataCallMethod, DataNaming } from '../src/lib';

export const TEST_CONFIG: DataConfig = {
    validEntity: {
        endPoints: {
            validEndPoint: {
                url: 'valid/path',
            },
        },
        naming: new DataNaming('entity', 'entities'),
        validWithIn: 10,
    },
    extraEntity: {
        endPoints: {
            extraEndPoint: {
                url: 'extra/{variable}/path',
                extraActions: {
                    extraActionId: {
                        method: DataCallMethod.GET,
                        extraUrl: '/another/url/{id}/path',
                        onSuccessMessage: 'Extra Action Executed Successfully!',
                    },
                },
            },
        },
    },
};

export interface ITestDto {
    id: string;
    name: string;
    description: string;
}
