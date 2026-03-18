interface MCPTool {
    name: string;
    description: string;
    inputSchema: object;
}
declare const tools: MCPTool[];
export declare class MCPKnowledgeServer {
    private engine?;
    private config;
    constructor(config: any);
    initialize(): Promise<void>;
    getTools(): MCPTool[];
    handleTool(name: string, args: any): Promise<any>;
}
export { tools };
