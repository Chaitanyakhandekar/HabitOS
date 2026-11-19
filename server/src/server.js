import { createServer } from 'http';
import app from './app.js';

export const httpServer = createServer(app);
export { app };
export default httpServer;
