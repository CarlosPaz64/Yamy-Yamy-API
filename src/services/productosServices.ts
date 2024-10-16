import { Producto, ProductoModel } from '../models/productoModel';

export class ProductoService {
  // Obtener todos los productos
  static async obtenerProductos(): Promise<Producto[]> {
    return await ProductoModel.obtenerTodos();
  }

  // Crear un nuevo producto
  static async crearProducto(producto: Producto): Promise<void> {
    await ProductoModel.crearProducto(producto);
  }
}