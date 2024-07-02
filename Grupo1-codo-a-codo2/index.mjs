import express from 'express';//carga el modulo para poder usar express en el programa
import 'dotenv/config';//para que mire las variables de entorno desde el archivo .env


const app = express();//asigna a una variable app el modulo cargado
const port = process.env.PORT || 3000;//asigna un puerto donde se abrira el servidor web localhost:3000

import cors from 'cors';

app.use(cors());

import pool from './config/db.js';
const db = pool;//yo llamo db al pool de base de datos para este proyecto

// Middleware para parsear el body de las requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Para servir archivos estáticos

//ruta de los filtros de la consulta del front

////////////////no me funciona/////////////////////////////
app.post('/query', async (req, res) => {
  try {
    const connection = await db.getConnection()
    const { query } = req.body;
    console.log("en req.body , la query trae esto", query);
    const results = await pool.query(query);
    console.log("lo que trae mi ruta post cunado ejecuta la query es :", results)
    res.json(results);
    connection.release()
  } catch (error) {
    console.log('Error al ejecutar la consulta:', error);
    res.status(500).json({ error: 'Error al procesar la consulta' });
  }
});


//////////////no funciona////////////////
app.get('/filtros', async (req, res) => {
  try {
    const connection = await db.getConnection()
    const { tipo_propiedad, operacion, precioMin, precioMax } = req.query;

    let query = 'SELECT * FROM propiedades WHERE 1 = 1';
    const values = [];

    if (tipo_propiedad) {
      query += ' AND tipo = ?';
      values.push(tipo_propiedad);
    }

    if (operacion) {
      query += ' AND operacion = ?';
      values.push(operacion);
    }

    if (precioMin) {
      query += ' AND precio >= ?';
      values.push(precioMin);
    }

    if (precioMax) {
      query += ' AND precio <= ?';
      values.push(precioMax);
    }

    const [results, fields] = await db.query(query, values);
    res.json(results);
    connection.release()
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las propiedades' });
  }
});


//ruta para consultar propiedades (listado de todas )

app.get('/propiedades', async (req, res) => {
  try {
    const connection = await db.getConnection()
    

const sql_query="SELECT p.id_propiedad,p.descripcion,p.precio,p.ubicacion,p.metros_cuadrados,p.ruta_imagen,tipos.tipo AS TIPOLOGIA,tipo_operaciones.descripcion AS OPERACION from propiedades as p JOIN tipos on p.id_tipo=tipos.id_tipo JOIN tipo_operaciones on p.id_operacion=tipo_operaciones.id_operacion order by p.id_propiedad"


    //const consulta='SELECT * FROM propiedades'
    const [rows] = await connection.query(sql_query);
    console.log([rows]);
    res.json(rows);
    connection.release()

  } catch (err) {

    res.status(500).json({ error: 'Error al obtener las propiedades' });
  }
});


//ruta para obtener propiedades por si id
app.get('/propiedades/:id', async (req, res) => {
  try {
    const connection = await db.getConnection()
  const Idpp = req.params.id
    console.log("El ID de la propiedad es ", Idpp)
    if (isNaN(Idpp) || Idpp <= 0) {
      return res.status(400).json({ error: 'ID de propiedad inválido' });
    }
    //obtener los datos dcon el id de la propiedad
    
    const [rows] = await db.query('SELECT p.id_propiedad ,p.precio,p.descripcion,p.metros_cuadrados,tipos.tipo as tipologia,tipo_operaciones.descripcion as operacion FROM propiedades as p join tipos on p.id_tipo=tipos.id_tipo JOIN tipo_operaciones on p.id_operacion=tipo_operaciones.id_operacion WHERE id_propiedad = ?', Idpp)
      //'SELECT * FROM propiedades WHERE id_propiedad = ?', Id_propiedad);
    if (rows.length > 0) {
      res.json(rows[0]);
      // cerrar la conexion 
      connection.release()

    } else {
      res.status(400).json({ error: 'Propiedad  no encontrada' });
    }
  } catch (err) {

    res.status(500).json({ error: 'Error al obtener la propiedad' });
  }
});
///ruta para agregar una propiedad con los datos
app.post('/propiedades/crear', async (req, res) => {
  try {
    const connection = await db.getConnection()
    const { id_tipo, id_operacion, precio, ubicacion, metros_cuadrados, ruta_imagen, id_propietario, descripcion, disponible } = req.body;

    // Validar los datos 
    if (isNaN(id_tipo) || id_tipo <= 0 || id_tipo >= 7) {
      return res.status(400).json({ error: " El tipo de propiedad no es válido" })
    }

    if (isNaN(id_operacion) || id_operacion <= 0 || id_operacion >= 3) {
      return res.status(400).json({ error: "El tipo de operación no es válido" })
    }
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: "El precio no puede menor o igual 0" })
    }
    if (!id_tipo || !id_operacion || !precio) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Insertar la nueva propiedad en la base de datos
    const [result] = await db.query(
      'INSERT INTO propiedades (id_tipo, id_operacion, precio, ubicacion, metros_cuadrados, ruta_imagen, id_propietario, descripcion, disponible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_tipo, id_operacion, precio, ubicacion, metros_cuadrados, ruta_imagen, id_propietario, descripcion, disponible]

    );

    // Devolver la respuesta con los datos del usuario creado 
    res.status(201).json({
      id: result.insertId,
      id_tipo,
      id_operacion,
      precio,
      ubicacion,
      metros_cuadrados,
      ruta_imagen,
      id_propietario,
      descripcion,
      disponible,

    });
    //cerrar la conexion 
    connection.release()
    console.log("Propiedad creada exitosamente")

  } catch (err) {
    console.error('Error al crear la propiedad:', err);
    res.status(500).json({ error: 'Error al crear la propiedad' });
  }
});

////hacer un delete  por Id_propiedad 
// 
app.get('/propiedades/borrar/:id', async (req, res) => {
  try {
    const connection = await db.getConnection()
    const { id } = req.params;

    // Verificar si la propiedaad existe
    const [prop] = await db.query(
      'SELECT * FROM propiedades WHERE id_propiedad = ?',
      [id]
    );

    if (prop.length === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Eliminar la propiedad de la base de datos
    const [result] = await db.query(
      'DELETE FROM propiedades WHERE id_propiedad = ?',
      [id]
    );



    // Devolver una respuesta de éxito
    res.status(200).json({ mensaje: 'Propiedad eliminada correctamente' });
    connection.release();
  } catch (err) {
    console.error('Error al eliminar la propiedad:', err);
    res.status(500).json({ error: 'Error al eliminar la propiedad' });
  }
});
//modificar propiedad  (actualizacion de datos de la propiedad)
app.post('/propiedades/modificar/:id', async (req, res) => {
  try {
    const connection = await db.getConnection()
    const { id } = req.params;
    const { id_tipo, id_operacion, precio, ubicacion, metros_cuadrados, ruta_imagen, id_propietario, descripcion, disponible } = req.body;
    // Validar los datos 
    if (isNaN(id_tipo) || id_tipo <= 0 || id_tipo >= 7) {
      return res.status(400).json({ error: " El tipo de propiedad no es válido" })
    }

    if (isNaN(id_operacion) || id_operacion <= 0 || id_operacion >= 3) {
      return res.status(400).json({ error: "El tipo de operación no es válido" })
    }
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: "El precio no puede menor o igual 0" })
    }
    if (!id_tipo || !id_operacion || !precio) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Actualizar el usuario en la tabla usuarios
    const [result] = await db.query(
      'UPDATE propiedades SET id_tipo = ?, id_operacion = ?, precio = ?, ubicacion = ?, metros_cuadrados = ?, ruta_imagen = ?, id_propietario=?, descripcion=?,disponible=?  WHERE id_propiedad = ?',
      [id_tipo, id_operacion, precio, ubicacion, metros_cuadrados, ruta_imagen, id_propietario, descripcion, disponible, id]
    );

    // Comprobar si se actualizó el usuario
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Devolver la respuesta con los datos de la propiedad actualizada
    res.status(200).json({
      id,
      id_tipo,
      id_operacion,
      precio,
      ubicacion,
      metros_cuadrados,
      ruta_imagen,
      id_propietario,
      descripcion,
      disponible,

    });
     //cerrar la conexion 
     connection.release()
  } catch (err) {
    console.error('Error al actualizar la propiedad:', err);
    res.status(500).json({ error: 'Error al actualizar la propiedad' });
  }
});





//////////////////////////////////////////////////7




app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto: ${port}`)
});
