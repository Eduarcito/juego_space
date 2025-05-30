# 🚀 Space Racing Game - Configuración de Base de Datos

## ⚡ Configuración Automática (Recomendada)

### Opción 1: Script Automático
1. Asegúrate de que **MySQL** esté ejecutándose
2. Abre tu navegador y ve a: `http://localhost/setup_database.php`
3. El script creará automáticamente:
   - Base de datos `space_racing_game`
   - Tablas necesarias
   - Usuario de prueba

### Credenciales de prueba creadas:
- **Usuario:** `testuser`
- **Contraseña:** `123456`
- **Créditos:** `100`

---

## 🔧 Configuración Manual

### Paso 1: Crear Base de Datos
```sql
CREATE DATABASE space_racing_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE space_racing_game;
```

### Paso 2: Ejecutar SQL
Ejecuta el archivo `database.sql` en tu base de datos.

### Paso 3: Configurar Credenciales
Edita el archivo `config.php` si tus credenciales son diferentes:
```php
$host = 'localhost';        // Tu host de MySQL
$username = 'root';         // Tu usuario de MySQL
$password = '';             // Tu contraseña de MySQL
$dbname = 'space_racing_game';
```

---

## 🐛 Solución de Problemas

### Error: "Base de datos no configurada"
1. Verifica que MySQL esté ejecutándose
2. Ejecuta `setup_database.php`
3. Verifica las credenciales en `config.php`

### Error: "Access denied"
1. Verifica usuario y contraseña en `config.php`
2. Asegúrate de que el usuario tenga permisos

### Error: "Database doesn't exist"
1. Crea la base de datos manualmente
2. O ejecuta `setup_database.php`

---

## 📋 Estructura de la Base de Datos

### Tabla: `players`
- `id` - ID único del jugador
- `username` - Nombre de usuario
- `password` - Contraseña encriptada
- `email` - Email del jugador
- `credits` - Créditos disponibles (default: 100)
- `best_score` - Mejor puntaje
- `total_games` - Total de partidas jugadas

### Tabla: `game_scores`
- `id` - ID único del puntaje
- `player_id` - ID del jugador
- `score` - Puntaje base
- `level_reached` - Nivel alcanzado
- `enemies_killed` - Enemigos eliminados
- `game_time` - Tiempo de juego
- `roulette_multiplier` - Multiplicador de ruleta
- `final_score` - Puntaje final
- `credits_used` - Créditos usados (default: 1)

---

## 🎮 Cómo Jugar

1. **Registrarse/Iniciar Sesión**
   - Ve a `index.html`
   - Crea una cuenta o usa: `testuser` / `123456`

2. **Verificar Créditos**
   - Cada partida cuesta 1 crédito
   - Los nuevos usuarios empiezan con 100 créditos

3. **Jugar**
   - Usa las flechas para moverte
   - Espacio para disparar
   - Sobrevive y elimina enemigos

4. **Ruleta de Multiplicadores**
   - Al terminar, usa la ruleta para multiplicar tu puntaje
   - Multiplicadores: x0, x0.5, x1, x1.5, x2, x3

5. **Sistema de Créditos**
   - Se descuenta 1 crédito automáticamente al usar la ruleta
   - El puntaje se guarda en la base de datos
   - Puedes ver tu historial y ranking

---

## 🔄 Comandos Útiles

### Reiniciar créditos de un usuario:
```sql
UPDATE players SET credits = 100 WHERE username = 'nombre_usuario';
```

### Ver ranking actual:
```sql
SELECT username, best_score, total_games FROM players ORDER BY best_score DESC LIMIT 10;
```

### Ver historial de partidas:
```sql
SELECT * FROM game_scores ORDER BY played_at DESC LIMIT 20;
```

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que MySQL esté ejecutándose
2. Revisa los logs de error de PHP
3. Asegúrate de que los archivos tengan permisos correctos
4. Ejecuta `setup_database.php` para diagnóstico automático
