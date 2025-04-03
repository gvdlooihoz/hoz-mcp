#!/usr/bin/env node

import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpFunction } from "./functions/function";
import { GetScheduleFunction } from "./functions/getschedule.function.js";
import { IsCustomerFunction } from "./functions/iscustomer.function.js";
import { RegisterLessonFunction } from "./functions/registerlesson.function.js";
import { CancelBookedLessonFunction } from "./functions/cancelbookedlesson.function.js";
import 'dotenv/config';

const mcpFunctions: Array<McpFunction> = [
  new GetScheduleFunction(), new IsCustomerFunction(), new RegisterLessonFunction(), new CancelBookedLessonFunction()
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

function installTools(server: McpServer): void {
    for (const f in mcpFunctions) {
        const func: McpFunction = mcpFunctions[f];
        server.tool(func.name, func.description, func.zschema, func.handleExecution);
    }
}
  
const server = new McpServer(
    {
        name: "HoZ Lesson Service",
        version: "0.2.0",
    }, 
    {
        capabilities: { tools: {} },
    }
);
installTools(server);

const app = express();

// Configure CORS middleware to allow all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  })
);

// Add a simple root route handler
app.get("/", (req, res) => {
  res.json({
    name: "HoZ Lesson MCP SSE Server",
    version: "0.2.0",
    status: "running",
    endpoints: {
      "/": "Server information (this response)",
      "/sse": "Server-Sent Events endpoint for MCP connection",
      "/messages": "POST endpoint for MCP messages",
    },
    tools: getTools(),
  });
});

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  const body = req.body;
	const params = req.body.params || {};
	params._meta = {
		headers: req.headers,
	};
	const enrichedBody = {
		...body,
		params,
	};
  await transport.handlePostMessage(req, res, enrichedBody);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HoZ Lesson MCP SSE Server running on port ${PORT}`);
});