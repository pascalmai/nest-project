module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true',
  entities: ['dist/**/*.entity{ .ts,.js}'],
  synchronize: false,
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsRun: true,
};
