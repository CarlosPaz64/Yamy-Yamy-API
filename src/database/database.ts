import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// Verificar la conexión a la base de datos
export async function verificarConexion() {
  try {
    const connection = await db.getConnection();
    await connection.query('SELECT 1');  // Ejecuta una consulta simple
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();  // Libera la conexión de vuelta al pool
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}

verificarConexion();