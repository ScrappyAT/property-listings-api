import app from './app';
import { config } from './config';

const start = () => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
