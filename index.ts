#!/usr/bin/env node
import { LessonServer } from './lesson-server.js';
import { RoomServer } from './room-server.js';

const lesson_server = new LessonServer();
lesson_server.run().catch(console.error);

const room_server = new LessonServer();
room_server.run().catch(console.error);