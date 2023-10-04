import { ConfigModule } from '@nestjs/config';
import { resolve } from "path";

const ENV = process.env.NODE_ENV;

const configModule = ConfigModule.forRoot({
  envFilePath: ENV ? resolve(`./environment/.env.${ENV}`) : resolve(`./environment/.env`),
});

export default configModule;