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
    url_imagen LONGBLOB,
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
    password_cliente VARCHAR(100) NOT NULL,
    numero_telefono VARCHAR(20),
    calle VARCHAR(255) NOT NULL, -- Calle del cliente
    numero_exterior VARCHAR(10) NOT NULL, -- Número exterior de la dirección
    numero_interior VARCHAR(10), -- Número interior, opcional
    colonia VARCHAR(100) NOT NULL, -- Colonia del cliente
    ciudad VARCHAR(100) NOT NULL, -- Ciudad
    codigo_postal VARCHAR(10) NOT NULL, -- Código postal
    descripcion VARCHAR(100) NOT NULL, -- Descripción de la ubicación del cliente
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

CREATE TABLE IF NOT EXISTS codigos(
	id_merida INT AUTO_INCREMENT PRIMARY KEY,
    codigo_postal_usuario VARCHAR(10),
    ciudad VARCHAR(50)
);

INSERT INTO codigos (codigo_postal_usuario, ciudad) VALUES
('97000', 'Mérida'),
('97003', 'Mérida'),
('97050', 'Mérida'),
('97059', 'Mérida'),
('97060', 'Mérida'),
('97068', 'Mérida'),
('97069', 'Mérida'),
('97070', 'Mérida'),
('97080', 'Mérida'),
('97088', 'Mérida'),
('97089', 'Mérida'),
('97098', 'Mérida'),
('97099', 'Mérida'),
('97100', 'Mérida'),
('97107', 'Mérida'),
('97108', 'Mérida'),
('97109', 'Mérida'),
('97110', 'Mérida'),
('97113', 'Mérida'),
('97114', 'Mérida'),
('97115', 'Mérida'),
('97116', 'Mérida'),
('97117', 'Mérida'),
('97118', 'Mérida'),
('97119', 'Mérida'),
('97120', 'Mérida'),
('97121', 'Mérida'),
('97125', 'Mérida'),
('97127', 'Mérida'),
('97128', 'Mérida'),
('97129', 'Mérida'),
('97130', 'Mérida'),
('97133', 'Mérida'),
('97134', 'Mérida'),
('97135', 'Mérida'),
('97136', 'Mérida'),
('97137', 'Mérida'),
('97138', 'Mérida'),
('97139', 'Mérida'),
('97140', 'Mérida'),
('97142', 'Mérida'),
('97143', 'Mérida'),
('97144', 'Mérida'),
('97145', 'Mérida'),
('97146', 'Mérida'),
('97147', 'Mérida'),
('97148', 'Mérida'),
('97149', 'Mérida'),
('97150', 'Mérida'),
('97155', 'Mérida'),
('97156', 'Mérida'),
('97157', 'Mérida'),
('97158', 'Mérida'),
('97159', 'Mérida'),
('97160', 'Mérida'),
('97165', 'Mérida'),
('97166', 'Mérida'),
('97167', 'Mérida'),
('97168', 'Mérida'),
('97169', 'Mérida'),
('97170', 'Mérida'),
('97173', 'Mérida'),
('97174', 'Mérida'),
('97175', 'Mérida'),
('97176', 'Mérida'),
('97177', 'Mérida'),
('97178', 'Mérida'),
('97179', 'Mérida'),
('97180', 'Mérida'),
('97189', 'Mérida'),
('97190', 'Mérida'),
('97195', 'Mérida'),
('97196', 'Mérida'),
('97197', 'Mérida'),
('97198', 'Mérida'),
('97199', 'Mérida'),
('97203', 'Mérida'),
('97204', 'Mérida'),
('97205', 'Mérida'),
('97206', 'Mérida'),
('97207', 'Mérida'),
('97208', 'Mérida'),
('97209', 'Mérida'),
('97210', 'Mérida'),
('97215', 'Mérida'),
('97217', 'Mérida'),
('97218', 'Mérida'),
('97219', 'Mérida'),
('97220', 'Mérida'),
('97225', 'Mérida'),
('97226', 'Mérida'),
('97227', 'Mérida'),
('97229', 'Mérida'),
('97230', 'Mérida'),
('97237', 'Mérida'),
('97238', 'Mérida'),
('97239', 'Mérida'),
('97240', 'Mérida'),
('97245', 'Mérida'),
('97246', 'Mérida'),
('97247', 'Mérida'),
('97249', 'Mérida'),
('97250', 'Mérida'),
('97255', 'Mérida'),
('97256', 'Mérida'),
('97258', 'Mérida'),
('97259', 'Mérida'),
('97260', 'Mérida'),
('97267', 'Mérida'),
('97268', 'Mérida'),
('97269', 'Mérida'),
('97270', 'Mérida'),
('97277', 'Mérida'),
('97278', 'Mérida'),
('97279', 'Mérida'),
('97280', 'Mérida'),
('97284', 'Mérida'),
('97285', 'Mérida'),
('97286', 'Mérida'),
('97287', 'Mérida'),
('97288', 'Mérida'),
('97289', 'Mérida'),
('97290', 'Mérida'),
('97295', 'Mérida'),
('97296', 'Mérida'),
('97297', 'Mérida'),
('97298', 'Mérida'),
('97299', 'Mérida'),
('97300', 'Mérida'),
('97302', 'Mérida'),
('97303', 'Mérida'),
('97304', 'Mérida'),
('97305', 'Mérida'),
('97306', 'Mérida'),
('97307', 'Mérida'),
('97308', 'Mérida'),
('97309', 'Mérida'),
('97310', 'Mérida'),
('97312', 'Mérida'),
('97314', 'Mérida'),
('97315', 'Mérida'),
('97316', 'Mérida'),
('97390', 'Umán'),
('97392', 'Umán'),
('97393', 'Umán'),
('97394', 'Umán'),
('97395', 'Umán'),
('97396', 'Umán'),
('97397', 'Umán'),
('97370', 'Kanasín'),
('97373', 'Kanasín'),
('97374', 'Kanasín'),
('97320', 'Progreso'),
('97324', 'Progreso'),
('97330', 'Progreso'),
('97333', 'Progreso'),
('97334', 'Progreso'),
('97336', 'Progreso');

-- DROP DATABASE YM;
-- afredo aescobar