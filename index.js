require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 8080;

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
app.get('/testdb', (req, res) => {
  connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
      return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    res.json({ message: 'Conexão com o banco de dados estabelecida com sucesso!' });
  });
});

// Rota para a API
app.get('/api/gold_customers', (req, res) => {
  const GOLD_VALUE = 100;

  const sql = `
    SELECT
        im.id_imovel,
        ti.categoria_imovel,
        im.desc_imovel,
        pag.valor_pagamento,
        pag.data_do_pagamento
    FROM
        imovel im
    LEFT JOIN
        tipo_imovel ti ON im.id_imovel = ti.id_imovel
    LEFT JOIN associacaopagamentos ap ON ap.id_imovel = im.id_imovel
    LEFT JOIN pagamento pag ON im.id_imovel = pag.id_imovel
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Processar os resultados da consulta SQL
      const goldCustomers = calculateGoldCustomers(result, GOLD_VALUE);
      
      // Enviar os "gold customers" como resposta JSON
      res.status(200).json(goldCustomers);
    }
  });
});
<<<<<<< HEAD

=======
>>>>>>> afbcbe7c54ae3957e64750b1e71abd5af854b764
function calculateGoldCustomers(results, goldValue) {
  const customerPayments = new Map();

  results.forEach((row) => {
    const customerId = row.id_imovel;
    const paymentAmount = row.valor_pagamento;

    if (!customerPayments.has(customerId)) {
      customerPayments.set(customerId, 0);
    }

    customerPayments.set(customerId, customerPayments.get(customerId) + paymentAmount);
  });

  const goldCustomers = Array.from(customerPayments.entries())
    .filter(([customerId, totalPayments]) => totalPayments > goldValue)
    .map(([customerId, totalPayments]) => ({
      id_imovel: customerId,
      total_pagamentos: totalPayments,
    }));

  return goldCustomers;
}

<<<<<<< HEAD
app.get('/api/payments_by_month_and_year', (req, res) => {
  const sql = `
    SELECT
        DATE_FORMAT(pag.data_do_pagamento, '%Y-%m') AS mes_ano,
        SUM(pag.valor_pagamento) AS total_pagamento
    FROM
        pagamento pag
    GROUP BY
        mes_ano
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Processar os resultados da consulta SQL
      const paymentsByMonthAndYear = result.map((row) => ({
        mes_ano: row.mes_ano,
        total_pagamento: row.total_pagamento,
      }));

      //filtrar pagamentos
      const minTotalValue = 100; // Valor mínimo desejado
      const filteredPayments = paymentsByMonthAndYear.filter((payment) => payment.total_pagamento > minTotalValue);

      // Filtrar pagamentos mês e ano
      res.status(200).json(filteredPayments);
    }
  });
});


=======
>>>>>>> afbcbe7c54ae3957e64750b1e71abd5af854b764
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
