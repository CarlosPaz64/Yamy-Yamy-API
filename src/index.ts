import express from 'express';
import dotenv from 'dotenv';
import { verificarConexion } from './database/database';  // Asegúrate de importar la función de conexión
import productosRoutes from './routes/productosRoute';  // Importar las rutas de productos
import adminRoutes from './routes/adminRoutes'; // Importa las rutas del administrador
import hashearContraseñasAdmin from './adminPassword/hashPassword'; // Importa el script de hasheo
const cors = require('cors');


dotenv.config();  // Cargar las variables de entorno desde el archivo .env

const app = express();

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Ejecutar el script para hashear las contraseñas al iniciar el servidor
(async () => {
  await hashearContraseñasAdmin(); // Asegúrate de esperar a que termine de ejecutar
})();

// Middleware para permitir que Express maneje JSON
app.use(express.json());

// Definir una ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Registrar las rutas de productos
app.use('/api/productos', productosRoutes);  // Ruta para los productos
// Usar las rutas de administrador en el prefijo /api/admin
app.use('/api/admin', adminRoutes);

// Verificar la conexión a la base de datos al iniciar el servidor
verificarConexion();  // Llamar a la función para verificar la conexión

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});