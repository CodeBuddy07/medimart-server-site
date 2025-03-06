import mongoose from 'mongoose';
import app from './app';
import config from './app/config';


async function main() {
  try {

    await mongoose.connect(config.databaseUrl as string, {});
  

    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to connect to MongoDB:', error.message);
    } else {
      console.error('Failed to connect to MongoDB:', error);
    }
    process.exit(1); 
  }
}


main();