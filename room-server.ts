#!/usr/bin/env node

import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpFunction } from "./functions/function";
import { IsTherapistFunction } from "./functions/istherapist.function.js";
import { BookRoomFunction } from "./functions/bookroom.function.js";
import { CancelBookedRoomFunction } from "./functions/cancelbookedroom.function.js";
import { GetAvailableRoomsFunction } from "./functions/getavailablerooms.function.js";
import { ApiKeyManager } from "./functions/apikeymanager.js";
import 'dotenv/config';

const mcpFunctions: Array<McpFunction> = [
  new GetAvailableRoomsFunction(), new IsTherapistFunction(), new BookRoomFunction(), new CancelBookedRoomFunction()
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
        name: "HoZ Room Service",
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

const transports: {[sessionId: string]: SSEServerTransport} = {};

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  const headers = req.headers;
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (headers) {
    if (headers.authorization && headers.authorization.startsWith("Bearer")) {
      const apiKey = headers.authorization.substring(7, headers.authorization.length);
      ApiKeyManager.setApiKey(sessionId, apiKey);
    }
  }
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`HoZ Room MCP SSE Server running on port ${PORT}`);
});