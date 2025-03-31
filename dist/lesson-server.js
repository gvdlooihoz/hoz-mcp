#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { GetScheduleFunction } from "./functions/getschedule.function.js";
import { IsCustomerFunction } from "./functions/iscustomer.function.js";
import { RegisterLessonFunction } from "./functions/registerlesson.function.js";
import { RegisterEventFunction } from "./functions/registerevent.function.js";
import { CancelBookedLessonFunction } from "./functions/cancelbookedlesson.function.js";
import { CancelBookedEventFunction } from "./functions/cancelbookedevent.function.js";
import 'dotenv/config';
const mcpFunctions = [
    new GetScheduleFunction(), new IsCustomerFunction(), new RegisterLessonFunction(),
    new CancelBookedLessonFunction(), new RegisterEventFunction(), new CancelBookedEventFunction()
];
function getTools() {
    const tools = [];
    for (const f in mcpFunctions) {
        const func = mcpFunctions[f];
        const name = func.name;
        const description = func.description;
        const inputSchema = func.inputschema;
        const tool = {
            name,
            description,
            inputSchema,
        };
        tools.push(tool);
    }
    return tools;
}
const server = new Server({
    name: "HoZ Lesson Service",
    version: "0.1.0",
}, {
    capabilities: { tools: {} },
});
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
    }
    catch (error) {
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
// async function runServer() {
//   const transport = new SSEServerTransport();
//   await server.connect(transport);
//   console.log("HoZ Lesson Service running on stdio");
// }
// runServer().catch((error) => {
//    console.error("Fatal error running server:", error);
//    process.exit(1);
// });
const app = express();
// Configure CORS middleware to allow all origins
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
}));
// Add a simple root route handler
app.get("/", (req, res) => {
    res.json({
        name: "HoZ Lesson MCP SSE Server",
        version: "0.1.0",
        status: "running",
        endpoints: {
            "/": "Server information (this response)",
            "/sse": "Server-Sent Events endpoint for MCP connection",
            "/messages": "POST endpoint for MCP messages",
        },
        tools: [
            { name: "add", description: "Add two numbers together" },
            { name: "search", description: "Search the web using Brave Search API" },
        ],
    });
});
let transport;
app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
});
app.post("/messages", async (req, res) => {
    // Note: to support multiple simultaneous connections, these messages will
    // need to be routed to a specific matching transport. (This logic isn't
    // implemented here, for simplicity.)
    await transport.handlePostMessage(req, res);
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`HoZ Lesson MCP SSE Server running on port ${PORT}`);
});
