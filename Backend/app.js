
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const saltRounds = 10; // Número de rondas de hashing

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blog_db",
});

app.use(cors());

// Middleware para procesar datos JSON
app.use(bodyParser.json());

// Endpoint para obtener todas las publicaciones
app.get("/publicaciones", (req, res) => {
  db.query("SELECT * FROM publicaciones", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Endpoint para crear una nueva publicación
app.post("/publicaciones", (req, res) => {
  const { usuario_id, titulo, descripcion, url_imagen } = req.body;
  const query =
    "INSERT INTO publicaciones (usuario_id, titulo, descripcion, url_imagen) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [usuario_id, titulo, descripcion, url_imagen],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "Publicación creada exitosamente." });
    }
  );
});

// Endpoint para registrar un nuevo usuario
app.post("/registro", async (req, res) => {
  const { nombre, contraseña } = req.body;

  // Generar salt y hash de la contraseña
  const sal = await bcrypt.genSalt(saltRounds);
  const hashContraseña = await bcrypt.hash(contraseña, sal);

  // Insertar el nuevo usuario en la base de datos
  const query = "INSERT INTO usuarios (nombre, contraseña) VALUES (?, ?)";
  db.query(query, [nombre, hashContraseña], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en el registro" });
    }

    res.json({ message: "Usuario registrado exitosamente" });
  });
});

// Endpoint para iniciar sesión
app.post("/login", async (req, res) => {
  const { nombre, contraseña } = req.body;

  // Obtener el hash de la contraseña del usuario
  const query = "SELECT * FROM usuarios WHERE nombre = ?";
  db.query(query, [nombre], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en el inicio de sesión" });
    }

    if (result.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    const hashContraseña = result[0].contraseña;

    // Comparar la contraseña del usuario con el hash almacenado
    const contraseñaCorrecta = await bcrypt.compare(contraseña, hashContraseña);

    if (!contraseñaCorrecta) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Si la contraseña es correcta, enviar el id del usuario mas mensaje de éxito
    res.json({ usuario_id: result[0].id, message: "Inicio de sesión exitoso" });
  });
});

// Endpoint para obtener el perfil de un usuario
app.get("/perfil/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  const query = "SELECT * FROM usuarios WHERE id = ?";
  db.query(query, [usuario_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener el perfil" });
    }

    res.json(result[0]);
  });
});

// Endpoint para obtener todos los usuarios existentes
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }

    res.json(result);
  });
});

// Endpoint para obtener un usuario específico
app.get("/usuarios/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  const query = "SELECT * FROM usuarios WHERE id = ?";
  db.query(query, [usuario_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener el usuario" });
    }

    res.json(result[0]);
  });
});

// Endpoint para eliminar un usuario
app.delete("/usuarios/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  const query = "DELETE FROM usuarios WHERE id = ?";
  db.query(query, [usuario_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al eliminar el usuario" });
    }

    res.json({ message: "Usuario eliminado exitosamente" });
  });
});

// Endpoint para obtener todas las publicaciones de un usuario
app.get("/publicaciones/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  const query = "SELECT * FROM publicaciones WHERE usuario_id = ?";
  db.query(query, [usuario_id], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Error al obtener las publicaciones" });
    }

    res.json(result);
  });
});

// Endpoint para eliminar una publicación
app.delete("/publicaciones/:publicacion_id", (req, res) => {
  const { publicacion_id } = req.params;

  const query = "DELETE FROM publicaciones WHERE id = ?";
  db.query(query, [publicacion_id], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Error al eliminar la publicación" });
    }

    res.json({ message: "Publicación eliminada exitosamente" });
  });
});

// Endpoint para editar una publicación
app.put("/publicaciones/:publicacion_id", (req, res) => {
  const { publicacion_id } = req.params;
  const { titulo, descripcion, url_imagen } = req.body;

  const query =
    "UPDATE publicaciones SET titulo = ?, descripcion = ?, url_imagen = ? WHERE id = ?";
  db.query(
    query,
    [titulo, descripcion, url_imagen, publicacion_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error al actualizar la publicación" });
      }

      res.json({ message: "Publicación actualizada exitosamente" });
    }
  );
});

// Endpoint para editar perfil de usuario teniendo hash de contraseña
app.put("/perfil/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  const { nombre, contraseña } = req.body;

  // Generar salt y hash de la contraseña
  const sal = await bcrypt.genSalt(saltRounds);
  const hashContraseña = await bcrypt.hash(contraseña, sal);

  const query = "UPDATE usuarios SET nombre = ?, contraseña = ? WHERE id = ?";
  db.query(query, [nombre, hashContraseña, usuario_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al actualizar el perfil" });
    }

    res.json({ message: "Perfil actualizado exitosamente" });
  });
});

// Endpoint para buscar un usuario por su nombre
app.get("/usuarios/nombre/:nombre", (req, res) => {
  const { nombre } = req.params;

  const query = "SELECT * FROM usuarios WHERE nombre LIKE ?";
  db.query(query, [`%${nombre}%`], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al buscar el usuario" });
    }

    res.json(result);
  });
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
