#!/usr/bin/env node
import { RoomServer } from './room-server.js';

const room_server = new RoomServer();
room_server.run().catch(console.error);