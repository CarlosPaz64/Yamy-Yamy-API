import express from 'express';
import dotenv from 'dotenv';
import { verificarConexion } from './database/database';  // Asegúrate de importar la función de conexión
import productosRoutes from './routes/productosRoute';  // Importar las rutas de productos


dotenv.config();  // Cargar las variables de entorno desde el archivo .env

const app = express();

// Middleware para permitir que Express maneje JSON
app.use(express.json());

// Definir una ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Registrar las rutas de productos
app.use('/api/productos', productosRoutes);  // Ruta para los productos

// Verificar la conexión a la base de datos al iniciar el servidor
verificarConexion();  // Llamar a la función para verificar la conexión

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});