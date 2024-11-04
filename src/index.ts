import express from 'express';
import dotenv from 'dotenv';
import { verificarConexion } from './database/database';  // Asegúrate de importar la función de conexión
import productosRoutes from './routes/productosRoute';  // Importar las rutas de productos
import adminRoutes from './routes/adminRoutes'; // Importa las rutas del administrador
import hashearContraseñasAdmin from './adminPassword/hashPassword'; // Importa el script de hasheo
import userRoutes from './routes/userRoutes';
import zipCodeRoute from './routes/zipCodeRoute'; // Importa la ruta de los codigos postales
import pedidoPersonalizadoRoute from './routes/pedidoPersonalizadoRoute';

const cors = require('cors');


dotenv.config();  // Cargar las variables de entorno desde el archivo .env

const app = express();

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Ejecutar el script para hashear las contraseñas al iniciar el servidor
(async () => {
  await hashearContraseñasAdmin(); // Asegúrate de esperar a que termine de ejecutar
})();

// Aumentar el límite de tamaño para las solicitudes JSON y URL-encoded
app.use(express.json({ limit: '10mb' })); // Aumenta el límite según sea necesario
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Definir una ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Registrar las rutas de productos
app.use('/api/productos', productosRoutes);  // Ruta para los productos
// Usar las rutas de administrador en el prefijo /api/admin
app.use('/api/admin', adminRoutes);
// Utilizar las rutas del cliente
app.use('/api/users', userRoutes);
// Ruta para los codigos postales
app.use('/api', zipCodeRoute); // Ruta para los codigos postales
// Ruta para el pedido personalizado
app.use('/api', pedidoPersonalizadoRoute); // Usa el prefijo /api


// Verificar la conexión a la base de datos al iniciar el servidor
verificarConexion();  // Llamar a la función para verificar la conexión

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});