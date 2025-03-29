export interface McpFunction {
    readonly name: string;
    readonly description: string;
    readonly inputschema: any;

    handleExecution(request): any;
}
  