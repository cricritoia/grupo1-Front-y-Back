import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,//host de clever cloud
  user: process.env.MYSQL_ADDON_USER,//usuario en clever cloud
  password: process.env.MYSQL_ADDON_PASSWORD,// password en clever cloud
  database: process.env.MYSQL_ADDON_DB,//nombre de la base de datos del proyecto en clever cloud
  connectionLimit: 5, // Número máximo de conexiones en el pool
  queueLimit: 0, // Número máximo de solicitudes en espera
  waitForConnections: true // Esperar a que haya una conexión disponible
 
});

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos CONECTADA');
    })
    .catch(err => console.error('Error al intentar conectarse a la bases de datos', err));


export default pool;


