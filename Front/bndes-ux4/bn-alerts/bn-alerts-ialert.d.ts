export interface IAlert {
    id: number;
    type: string;
    title: string;
    message: string;
    closed: boolean;
    timeout: number;
}
