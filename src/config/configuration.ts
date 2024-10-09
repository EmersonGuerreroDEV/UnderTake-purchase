export const EnvConfiguration = () => ({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'u878370420_undertake',
  username: process.env.DB_USER || 'u878370420_undertake',
  password: process.env.PASSWORD || 'Berasflow21#',
});
