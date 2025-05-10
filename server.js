const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejar otras rutas
app.get('*', (req, res) => {
  // Intentar servir el archivo HTML correspondiente
  const requestedPage = req.path.substring(1); // Quitar la barra inicial
  const htmlPath = path.join(__dirname, 'html', `${requestedPage}.html`);
  
  res.sendFile(htmlPath, (err) => {
    if (err) {
      // Si el archivo no existe, redirigir a la página principal
      res.redirect('/');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});