import crypto from 'crypto';

const secretKey = crypto.createHash('sha256').update(process.env.SECRET_KEY || 'my_secret_key_32_chars').digest();
const ivLength = 16; // Longitud de IV para AES

// Encripta los datos
export function encrypt(data: string): string {
  const iv = crypto.randomBytes(ivLength); // Genera IV aleatorio
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  
  let encrypted = cipher.update(data, 'utf-8', 'base64');
  encrypted += cipher.final('base64');

  // Concatenamos IV + Encrypted Data y lo codificamos en base64
  return iv.toString('base64') + ':' + encrypted;
}

// Desencripta los datos
export function decrypt(data: string): string {
  const [ivBase64, encryptedData] = data.split(':'); // Separamos IV y datos encriptados
  const iv = Buffer.from(ivBase64, 'base64'); // Reconstruimos IV desde base64

  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
  
  let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}
