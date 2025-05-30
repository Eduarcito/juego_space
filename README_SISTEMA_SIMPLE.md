# 🚀 Space Racing Game - Sistema Simple (Sin Servidor)

## ✅ Solución al Error de Conexión

Este sistema funciona **completamente en el navegador** sin necesidad de configurar MySQL, PHP o servidor web.

## 📁 Archivos del Sistema Simple

### 🎮 Archivos Principales
- **`index_simple.html`** - Página de inicio y login (SIN SERVIDOR)
- **`game_simple.html`** - Juego completo (SIN SERVIDOR)
- **`simple_auth.js`** - Sistema de autenticación local
- **`game_simple.js`** - Lógica del juego

## 🔧 Archivos Innecesarios para el Sistema Simple (pueden eliminarse)
- `index.html`
- `game.html`
- `auth.php`
- `config.php`
- `local_storage_db.js`
- `game.js`
- `config_database.php`
- `setup_database.php`
- `database.sql`

## 🚀 Cómo Usar el Sistema Simple

### 1. **Abrir el Juego**
```
Hacer doble clic en: index_simple.html
```

### 2. **Iniciar Sesión**
- **Usuario de prueba**: `testuser`
- **Contraseña**: `123456`
- **O crear cualquier usuario nuevo**

### 3. **Jugar**
- Cada usuario nuevo empieza con **100 créditos**
- Cada partida cuesta **1 crédito**
- Los puntajes se guardan automáticamente

## 🎮 Controles del Juego

| Tecla | Acción |
|-------|--------|
| ⬅️➡️ | Mover nave horizontalmente |
| ⬆️⬇️ | Mover nave verticalmente |
| 🚀 **ESPACIO** | Disparar láser |
| ⏸️ **P** | Pausar/Reanudar |

## ⚡ Power-Ups

| Símbolo | Efecto | Duración |
|---------|--------|----------|
| 🛡️ | Escudo protector | 5 segundos |
| ⚡ | Velocidad doble | 5 segundos |
| 🔫 | Triple disparo | 5 segundos |
| ❤️ | +30 puntos de vida | Instantáneo |

## 🏆 Sistema de Puntuación

- **Enemigos básicos**: 10 puntos × nivel
- **Monstruos**: 10 puntos × nivel (requieren 2 disparos)
- **Subir nivel**: Cada 10 enemigos eliminados
- **Ruleta**: Multiplicadores x0, x0.5, x1, x1.5, x2, x3

## 💾 Almacenamiento de Datos

### ✅ **Sistema Simple (localStorage)**
- ✅ Funciona sin servidor
- ✅ Datos guardados en el navegador
- ✅ No requiere configuración
- ✅ Usuarios y puntajes persistentes

## 🔄 Preparar para VPS con cPanel y MySQL

Cuando suba el proyecto al VPS con cPanel y cree la base de datos MySQL, deberá:

1. Subir los archivos originales:
   - `index.html`
   - `game.html`
   - `auth.php`
   - `config.php`
   - `setup_database.php`
   - `config_database.php`
   - `database.sql`

2. Crear la base de datos y usuario MySQL en cPanel.

3. Configurar `config.php` con los datos de conexión MySQL (host, usuario, contraseña, nombre de BD).

4. Ejecutar `setup_database.php` para crear tablas y datos iniciales.

5. Usar el sistema original con backend PHP y MySQL.

## 🔧 Configuración de conexión MySQL en `config.php`

```php
<?php
$host = 'localhost'; // o IP del servidor MySQL
$dbname = 'nombre_base_de_datos';
$user = 'usuario_mysql';
$password = 'contraseña_mysql';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
?>
```

## 🏁 Resumen

- Para desarrollo local sin servidor, use el sistema simple con archivos `index_simple.html` y `game_simple.html`.
- Para producción en VPS con cPanel y MySQL, use el sistema original y configure la base de datos.
- El sistema simple puede eliminarse cuando se migre a producción.

---

Si desea, puedo ayudarle a preparar un paquete ZIP con solo los archivos principales para subir al VPS.
