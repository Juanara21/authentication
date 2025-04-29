const { MongoClient, ServerApiVersion } = require('mongodb');

// ¡Aquí ponemos la URI corregida!
const uri = "mongodb+srv://Juanaraujo21:1118875006%2B@cluster0.w4dvyws.mongodb.net/authentication?retryWrites=true&w=majority&tls=true&appName=Cluster0";

// Creamos el cliente de MongoDB con opciones
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Conectamos el cliente
    await client.connect();

    // Enviamos un ping a la base de datos 'authentication'
    await client.db("authentication").command({ ping: 1 });

    console.log("¡Conectado exitosamente a MongoDB Atlas!");
  } catch (error) {
    console.error(" Error al conectar a MongoDB:", error);
  } finally {
    // Cerramos la conexión
    await client.close();
  }
}

// Ejecutamos
run().catch(console.dir);
