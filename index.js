const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = "rogamone"; // Sua chave mestra para os tokens

// --- CONFIGURAÇÕES BASE ---
app.use(cors());
app.use(express.json());

// Configuração da conexão com o banco Rogam (Lembre de trocar SUA_SENHA_AQUI)
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rogam_db",
  password: "rogamone",
  port: 5432,
});

// Middleware de Segurança (CSP)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000; script-src 'self' 'unsafe-inline';",
  );
  next();
});

// --- MIDDLEWARE DE PROTEÇÃO (O SEGURANÇA) ---
const verificarToken = (req, res, next) => {
  // O token geralmente vem no cabeçalho 'authorization'
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    // Remove a palavra "Bearer " se ela existir e valida com a sua chave "rogamone"
    const tokenLimpo = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token;
    const verificado = jwt.verify(tokenLimpo, JWT_SECRET);

    req.user = verificado; // Guarda os dados do usuário na requisição
    next(); // Autorizado! Pode seguir para a rota
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// --- ROTAS DE AUTENTICAÇÃO ---

// Registro de novo Publisher
app.post("/v1/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO publishers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash],
    );
    res.json({ message: "Publisher registrado!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar. Email já existe?" });
  }
});

// LOGIN: Aqui é onde o JWT é gerado (Próximo passo técnico)
app.post("/v1/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM publishers WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return res.status(401).json({ error: "Senha inválida" });

    // Gera o "crachá" (Token) válido por 24 horas
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ status: "Success", token });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// --- ROTAS DO SISTEMA (ADTECH) ---

// Ingestão de lances (Aberta para os sites enviarem dados)
app.post("/v1/capture", async (req, res) => {
  const { publisher_id, ad_unit, bidder, cpm, latency } = req.body;
  try {
    const query = `
            INSERT INTO auction_logs (publisher_id, ad_unit, bidder, cpm, latency, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `;
    await pool.query(query, [publisher_id, ad_unit, bidder, cpm, latency]);
    res.status(201).send({ status: "Data Persisted" });
  } catch (err) {
    console.error("Erro na Ingestão do Rogam:", err);
    res.status(500).send({ error: "Database Failure" });
  }
});

// Relatório de Analytics (Será protegida por JWT no próximo passo)
// --- ROTA DE STATS PROTEGIDA ---
// Note que agora incluímos o 'verificarToken' antes da função principal
app.get("/v1/stats", verificarToken, async (req, res) => {
  try {
    const query = `
            SELECT 
                bidder, 
                COUNT(*) as total_leiloes,
                ROUND(AVG(cpm), 2) as cpm_medio,
                ROUND(AVG(latency), 0) as latencia_media
            FROM auction_logs
            GROUP BY bidder
            ORDER BY cpm_medio DESC
        `;
    const stats = await pool.query(query);
    res.json({
      status: "Success",
      data: stats.rows,
      message: "Relatório gerado com sucesso.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao gerar relatório" });
  }
});

app.listen(3000, () => console.log("Rogam Engine Ativa na porta 3000"));
