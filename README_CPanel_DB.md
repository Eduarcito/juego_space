# Guía para Crear Base de Datos MySQL en cPanel y Configurar Space Racing Game

## 1. Acceder a cPanel

- Ingrese a su panel de control cPanel con sus credenciales proporcionadas por su proveedor de hosting.

## 2. Crear Base de Datos MySQL

- En la sección **Bases de Datos**, haga clic en **Bases de Datos MySQL**.
- En el campo **Crear nueva base de datos**, ingrese un nombre para la base de datos, por ejemplo: `space_racing_game`.
- Haga clic en **Crear base de datos**.

## 3. Crear Usuario MySQL

- En la sección **Usuarios MySQL**, cree un nuevo usuario:
  - Ingrese un nombre de usuario, por ejemplo: `usuario_game`.
  - Ingrese una contraseña segura.
  - Haga clic en **Crear usuario**.

## 4. Asignar Usuario a la Base de Datos

- En **Agregar usuario a la base de datos**:
  - Seleccione el usuario creado.
  - Seleccione la base de datos creada.
  - Haga clic en **Agregar**.
- En la siguiente pantalla, otorgue **Todos los privilegios** y guarde.

## 5. Importar Estructura y Datos

- En cPanel, abra **phpMyAdmin**.
- Seleccione la base de datos creada.
- Haga clic en la pestaña **Importar**.
- Seleccione el archivo `database.sql` del proyecto.
- Haga clic en **Continuar** para importar las tablas y datos.

## 6. Configurar Archivo `config.php`

- Edite el archivo `config.php` en su proyecto.
- Cambie las variables para que coincidan con su configuración:

```php
$host = 'localhost'; // Generalmente localhost
$dbname = 'space_racing_game'; // Nombre de la base creada
$username = 'usuario_game'; // Usuario MySQL creado
$password = 'su_contraseña'; // Contraseña del usuario
```

- Guarde los cambios.

## 7. Subir Archivos al VPS

- Suba todos los archivos del proyecto al VPS usando FTP o el administrador de archivos de cPanel.
- Asegúrese de incluir:
  - `index.html`
  - `game.html`
  - `auth.php`
  - `config.php`
  - `setup_database.php`
  - `config_database.php`
  - `database.sql`

## 8. Probar la Aplicación

- Acceda a la URL de su VPS donde subió el proyecto.
- Inicie sesión y pruebe el juego.
- Verifique que la conexión a la base de datos funcione correctamente.

---

Si necesita ayuda adicional para configurar el VPS o la base de datos, no dude en consultarme.
