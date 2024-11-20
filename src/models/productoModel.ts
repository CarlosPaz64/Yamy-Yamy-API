import { db } from '../database/database';

// Definir un nuevo tipo para productos que están siendo creados (sin product_id)
export interface NuevoProducto {
  nombre_producto: string;
  descripcion_producto: string;
  precio: number;
  categoria: string;
  stock: number;
  url_imagen: Buffer; // Se usa Buffer para la imagen
  epoca?: string;
}

export interface Producto extends NuevoProducto {
  product_id: number; // Solo se añade en la base de datos
}

export class ProductoModel {
  // Obtener todos los productos
  static async obtenerTodos(): Promise<Producto[]> {
    const [rows]: any[] = await db.query('SELECT * FROM producto');

    // Convertir Buffer a base64 si es necesario
    const productos = rows.map((producto: any) => {
      if (producto.url_imagen && Buffer.isBuffer(producto.url_imagen)) {
        let mimeType = 'image/png'; // Tipo MIME por defecto

        // Si estás almacenando el tipo MIME en la base de datos o sabes el tipo, ajusta esto
        if (producto.mime_type) {
          mimeType = producto.mime_type; // Asegúrate de tener este dato si no es siempre PNG
        }

        // Convertir el Buffer a una cadena base64 con el tipo MIME correcto
        producto.url_imagen = `data:${mimeType};base64,${producto.url_imagen.toString('base64')}`;
      }
      return producto;
    });

    return productos as Producto[];
  }

  // Crear un nuevo producto (sin product_id)
  static async crearProducto(producto: NuevoProducto): Promise<void> {
    const { nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca } = producto;

    await db.query(
      'INSERT INTO producto (nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca]
    );
  }

  // Obtener todos los productos ordenados por categoría
  static async obtenerTodosOrdenadosPorCategoria(): Promise<Producto[]> {
    const query = `
      SELECT * FROM producto 
      ORDER BY FIELD(categoria, 
        'Cupcake', 
        'Cupcake personalizado', 
        'Pastel', 
        'Pastel personalizado', 
        'Postre', 
        'Producto de temporada'
      )
    `;

    const [rows]: any[] = await db.query(query);

    // Convertir Buffer a base64 si es necesario
    const productos = rows.map((producto: any) => {
      if (producto.url_imagen && Buffer.isBuffer(producto.url_imagen)) {
        let mimeType = 'image/png'; // Tipo MIME por defecto

        // Ajusta el tipo MIME si tienes información almacenada en la BD
        if (producto.mime_type) {
          mimeType = producto.mime_type; 
        }

        // Convertir Buffer a base64 con prefijo MIME
        producto.url_imagen = `data:${mimeType};base64,${producto.url_imagen.toString('base64')}`;
      }
      return producto;
    });

    return productos as Producto[];
  }

  // Obtener un producto por su ID
  static async getProductById(product_id: number): Promise<Producto | null> {
    const query = 'SELECT * FROM producto WHERE product_id = ?';
    const [rows]: any[] = await db.query(query, [product_id]);

    if (rows.length === 0) return null;

    const producto = rows[0];

    // Convertir el Buffer de la imagen a base64 si es necesario
    if (producto.url_imagen && Buffer.isBuffer(producto.url_imagen)) {
      let mimeType = 'image/png'; // Tipo MIME por defecto

      if (producto.mime_type) {
        mimeType = producto.mime_type;
      }

      producto.url_imagen = `data:${mimeType};base64,${producto.url_imagen.toString('base64')}`;
    }

    return producto as Producto;
  }
}
