CREATE DATABASE IF NOT EXISTS YM;
USE YM;

CREATE TABLE IF NOT EXISTS administrador (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_admin VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS producto (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion_producto TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria ENUM('Cupcake', 'Cupcake personalizado', 'Pastel', 'Pastel personalizado', 'Brownies', 'Postre', 'Postre personalizado', 'Crepas', 'Roles', 'Galleta', 'Galleta personalizada', 'Producto de temporada') NOT NULL,
    stock INT NOT NULL,
    url_imagen VARCHAR(255),
    epoca VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Mi comentarios
CREATE TABLE IF NOT EXISTS cliente (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(50) NOT NULL,
    apellido_cliente VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    numero_telefono VARCHAR(20),
    calle VARCHAR(255) NOT NULL, -- Calle del cliente
    numero_exterior VARCHAR(10) NOT NULL, -- Número exterior de la dirección
    numero_interior VARCHAR(10), -- Número interior, opcional
    colonia VARCHAR(100) NOT NULL, -- Colonia del cliente
    ciudad VARCHAR(100) NOT NULL, -- Ciudad
    codigo_postal VARCHAR(10) NOT NULL, -- Código postal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orden (
    orden_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    precio_total DECIMAL(10, 2) NOT NULL,
    tipo_entrega ENUM('Domicilio', 'Recoger en tienda') NOT NULL,
    direccion_entrega VARCHAR(255), -- Dirección completa para la entrega
    fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_orden ENUM('Pendiente', 'En proceso', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    url_imagen VARCHAR(255),
    FOREIGN KEY (client_id) REFERENCES cliente(client_id)
);

CREATE TABLE IF NOT EXISTS detalles_orden (
    detalles_orden_id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT,
    product_id INT,
    cantidad INT NOT NULL,
    url_imagen VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (orden_id) REFERENCES orden(orden_id),
    FOREIGN KEY (product_id) REFERENCES producto(product_id)
);

CREATE TABLE IF NOT EXISTS producto_personalizado (
    producto_personalizado_id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT,
    tipo_producto ENUM('Cupcake', 'Galleta', 'Pastel') NOT NULL, -- Definimos los productos personalizables
    tamaño ENUM('Pequeño', 'Mediano', 'Grande') NOT NULL, -- Tamaño del producto personalizado
    sabor VARCHAR(50) NOT NULL,
    mensaje TEXT, -- Mensaje personalizado si aplica
    decoracion TEXT, -- Detalles de la decoración personalizada
    url_imagen VARCHAR(255),
    FOREIGN KEY (orden_id) REFERENCES orden(orden_id)
);

-- Creación de la tabla para el primer carrusel de imágenes
CREATE TABLE IF NOT EXISTS carrusel_1 (
    idImagen INT AUTO_INCREMENT PRIMARY KEY, 
    imagen LONGBLOB NOT NULL,  -- Almacena la imagen en base64
    nombreImagen VARCHAR(255) -- Nombre del archivo (opcional)
);

-- Valores de ejemplo para el loggin del admnistrador
INSERT INTO administrador (username, password_admin, email)
VALUES ('admin123', 'passwordSegura123', 'admin@example.com');

-- DROP DATABASE YM;
-- afredo aescobar