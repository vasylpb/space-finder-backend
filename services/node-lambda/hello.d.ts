declare function handler(event: any, context: any): Promise<{
    statusCode: number;
    body: string;
}>;
export { handler };
