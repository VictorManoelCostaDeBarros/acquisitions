import app from './app.js';
import logger from '#config/logger.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('Hello from acquisitions api');
  console.log(`Server is running on port ${PORT}`);
});
