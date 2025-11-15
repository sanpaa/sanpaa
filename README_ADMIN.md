# Alancarmo Corretor - Website Profissional

Website completo para a corretora Alancarmo, especializada em seguros, imóveis e financiamentos.

## 🚀 Funcionalidades

### Site Principal
- ✅ Design responsivo e moderno
- ✅ Seções: Início, Sobre, Serviços, Imóveis, Depoimentos, Contato
- ✅ Integração com WhatsApp
- ✅ Botão flutuante do WhatsApp
- ✅ Otimização SEO
- ✅ Carrossel de depoimentos
- ✅ Formulário de contato
- ✅ Google Maps integrado

### Painel Administrativo
- ✅ Gerenciamento completo de imóveis
- ✅ Adicionar, editar e excluir imóveis
- ✅ Campos: tipo, título, descrição, preço, localização, quartos, banheiros, área, vagas, imagem, contato
- ✅ Interface intuitiva e responsiva
- ✅ Visualização em cards
- ✅ API REST para integração

## 📋 Pré-requisitos

- Node.js v20.19.5 ou superior
- npm 10.8.2 ou superior

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/sanpaa/sanpaa.git
cd sanpaa
```

2. Instale as dependências:
```bash
npm install
```

## ▶️ Como Usar

### Iniciar o servidor

```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

### Acessar o site

Abra o navegador e acesse:
- **Site principal**: http://localhost:3000
- **Painel administrativo**: http://localhost:3000/admin

## 🏠 Painel Administrativo

### Acessar o painel
Acesse `http://localhost:3000/admin` para gerenciar os imóveis.

### Adicionar um imóvel
1. Clique em "Adicionar Imóvel"
2. Preencha os campos obrigatórios:
   - Tipo de Imóvel
   - Título
   - Preço
   - Localização
   - Contato
3. Opcionalmente, adicione:
   - Descrição
   - Quartos, Banheiros, Área, Vagas
   - URL da Imagem
4. Clique em "Salvar"

### Editar um imóvel
1. Clique em "Editar" no card do imóvel
2. Modifique as informações
3. Clique em "Salvar"

### Excluir um imóvel
1. Clique em "Excluir" no card do imóvel
2. Confirme a exclusão

## 🎨 Personalização

### Cores
As cores principais podem ser alteradas no arquivo `styles.css`:
- Primary Color: `#004AAD`
- Secondary Color: `#0066CC`
- Light Gray: `#F5F5F5`

### Contato WhatsApp
Atualize o número de telefone no arquivo `index.html`:
- Procure por `5511999999999`
- Substitua pelo número real (formato: código do país + DDD + número)

### Google Maps
Atualize a localização no iframe do Google Maps em `index.html`.

## 📂 Estrutura de Arquivos

```
/
├── index.html          # Página principal do site
├── styles.css          # Estilos CSS
├── script.js           # JavaScript do site
├── server.js           # Servidor Node.js + API REST
├── package.json        # Dependências do projeto
├── .gitignore         # Arquivos ignorados pelo Git
├── admin/
│   ├── index.html     # Painel administrativo
│   └── admin.js       # JavaScript do painel
└── data/
    └── properties.json # Banco de dados dos imóveis
```

## 🔌 API Endpoints

### GET /api/properties
Retorna todos os imóveis cadastrados.

### GET /api/properties/:id
Retorna um imóvel específico.

### POST /api/properties
Cria um novo imóvel.

### PUT /api/properties/:id
Atualiza um imóvel existente.

### DELETE /api/properties/:id
Exclui um imóvel.

## 📱 Responsividade

O site é totalmente responsivo e funciona perfeitamente em:
- ✅ Desktop (1280px+)
- ✅ Tablet (768px - 1279px)
- ✅ Mobile (até 767px)

## 🛡️ Segurança

- Os dados são armazenados localmente em JSON
- Não há autenticação no painel (recomenda-se adicionar em produção)
- Validação de formulários no frontend

## 🚀 Deploy

### GitHub Pages (apenas frontend estático)
O site estático pode ser hospedado no GitHub Pages, mas o painel administrativo requer um servidor Node.js.

### Heroku, Vercel, ou Railway (com backend)
Para usar o painel administrativo, faça deploy em uma plataforma que suporte Node.js:

1. Configure as variáveis de ambiente (se necessário)
2. Faça push para a plataforma
3. O servidor iniciará automaticamente

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do WhatsApp ou abra uma issue no GitHub.

## 📄 Licença

ISC License

---

Desenvolvido com ❤️ para Alancarmo Corretor
