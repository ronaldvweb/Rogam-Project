# Rogam Analytics - Yield Optimization Engine 📊

O **Rogam** é uma plataforma de monitoramento e análise de leilões de anúncios (AdTech) em tempo real. O sistema foi desenvolvido para resolver o problema de opacidade em lances de Header Bidding, permitindo que Publishers visualizem a performance de diferentes parceiros de demanda (Bidders) de forma centralizada.

## 🛠️ Tecnologias Utilizadas
* **Backend:** Node.js com Express.js
* **Banco de Dados:** PostgreSQL 17.9 (Relacional)
* **Segurança:** Autenticação via JSON Web Token (JWT) e criptografia de senhas com bcrypt.
* **Frontend:** Dashboard responsivo com Tailwind CSS e JavaScript Assíncrono (Fetch API).
* **Ambiente:** PowerShell 7 / Windows.

## 🏗️ Arquitetura do Sistema
O projeto segue o modelo de microserviços simplificado, focado em alta disponibilidade para ingestão de dados:

1.  **Camada de Ingestão (`/v1/capture`):** Endpoint otimizado para receber milhares de lances de anúncios via POST.
2.  **Camada de Inteligência (`/v1/stats`):** Engine de agregação SQL que calcula eCPM médio e Latência por Bidder.
3.  **Camada de Segurança:** Middleware de proteção que valida tokens JWT antes de liberar dados sensíveis de faturamento.



## 🔐 Diferenciais de Segurança
Diferente de projetos acadêmicos simples, o Rogam implementa padrões de mercado:
* **Zero-Trust para Analytics:** Ninguém acessa os relatórios sem um Token válido.
* **Password Hashing:** As senhas dos usuários nunca são armazenadas em texto puro, garantindo a integridade dos dados mesmo em caso de vazamento do banco.
* **Stateless Auth:** O servidor não mantém sessões em memória, permitindo escala horizontal.

## 🚀 Como Executar o Projeto
1. Clone o repositório.
2. Configure as variáveis de ambiente no `index.js` (DB_PASSWORD e JWT_SECRET).
3. Execute `npm install`.
4. Inicie o servidor: `node index.js`.
5. Utilize o PowerShell para realizar o login e obter seu Token de acesso.

---
**Desenvolvido por Ronaldo Junior da Cruz** *Estudante de Análise e Desenvolvimento de Sistemas (ADS)*

