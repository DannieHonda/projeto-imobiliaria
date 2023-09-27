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
app.get('/api/porcentagem_de_vendas', function (req, res) {
  const sql = `
  select ti.categoria_imovel, valor_pagamento
from tipo_imovel ti
join pagamento pag on ti.id_imovel= pag.id_imovel;
  `;
  connection.query(sql, function (err, result) {
    if (err) {
      console.error('Erro ao executar a consulta SQL:', err);
      res.status(500).send(JSON.stringify(err));
    } else {
      let sum = 0;
      const percentages = new Map();

      for (const row of result) {
        sum += row.valor_pagamento;
      }

      for (const row of result) {
        const categoriaDoImovel = row.categoria_imovel;
        const valorPagamento = row.valor_pagamento;

        const percentage = ((valorPagamento / sum) * 100).toFixed(3);

        if (!percentages.has(categoriaDoImovel)) {
          percentages.set(categoriaDoImovel, {
            porcentagem: percentage,
            categoria: categoriaDoImovel,
          });
        } else {
          percentages.get(categoriaDoImovel).porcentagem  = (parseFloat(percentages.get(categoriaDoImovel).porcentagem) + parseFloat(percentage)).toFixed(3) + '%';   
        }
      }

      const arrayPercentages = Array.from(percentages.values());
    
      // Enviar as porcentagens como JSON
      res.status(200).json(arrayPercentages);
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
