#!/usr/bin/env node
import { LessonServer } from './lesson-server.js';

const lesson_server = new LessonServer();
lesson_server.run().catch(console.error);
