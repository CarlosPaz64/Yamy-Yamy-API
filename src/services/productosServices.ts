import { ProductoModel, NuevoProducto, Producto } from '../models/productoModel'; 

export class ProductoService {
  // Servicio para obtener todos los productos
  static async obtenerProductos(): Promise<Producto[]> {
    try {
      const productos = await ProductoModel.obtenerTodos();
      return productos;
    } catch (error) {
      throw new Error('Error al obtener productos');
    }
  }

  // Servicio para obtener productos por categoría
  static async obtenerProductosPorCategoria(): Promise<Producto[]> {
    try {
      const productos = await ProductoModel.obtenerTodosOrdenadosPorCategoria();
      return productos;
    } catch (error) {
      throw new Error('Error al obtener productos por categoría');
    }
  }
}
