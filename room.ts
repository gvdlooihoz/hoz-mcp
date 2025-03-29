#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpFunction } from "./functions/function";
import { IsTherapistFunction, BookRoomFunction, CancelBookedRoomFunction } from "./functions";
import 'dotenv/config';

const mcpFunctions: Array<McpFunction> = [
    new IsTherapistFunction(), new BookRoomFunction(), new CancelBookedRoomFunction()
];

function getTools(): Array<Tool> {
    const tools: Array<Tool> = [];
    for (const f in mcpFunctions) {
        const func = mcpFunctions[f];
        const name = func.name;
        const description = func.description;
        const inputSchema = func.inputschema;
        const tool: Tool = {
            name,
            description,
            inputSchema,
        }
        tools.push(tool);
    }
    return tools;
}
  
const server = new Server(
    {
        name: "HoZ Room Service",
        version: "0.1.0",
    }, 
    {
        capabilities: { tools: {} },
    }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getTools()
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;    
        if (!args) {
            throw new Error("No arguments provided");
        }

        for (const f in mcpFunctions) {
            const func = mcpFunctions[f];
            if (func.name === name) {
                return func.handleExecution(request);
            }
        }
        return {
            content: [
                {
                    type: "text", 
                    text: "Unknown tool: ${name}" 
                }
            ],
            isError: true,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: ${error instanceof Error ? error.message : String(error)}",
                }
            ],
            isError: true,
        };
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("HoZ Room Service running on stdio");
}
  
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});