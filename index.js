require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8080;

// Configurações de conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Rota para testar a conexão com o banco de dados
app.get('/testdb', (req, res) => {
  connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      res.status(500).send('Erro ao conectar ao banco de dados');
      return;
    }
    console.log('Conexão estabelecida com sucesso!');
    res.send('Conexão com o banco de dados estabelecida com sucesso!');

    // Fechar a conexão após o teste
    connection.end((err) => {
      if (err) {
        console.error('Erro ao fechar a conexão:', err);
        return;
      }
      console.log('Conexão fechada.');
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
