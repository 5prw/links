# Links Manager

Um sistema de gerenciamento de links pessoal moderno e responsivo, desenvolvido com Go e Vue.js 3.

## 🚀 Características

### Funcionalidades Principais
- **Gerenciamento de Links**: Adicione, edite e exclua links facilmente
- **Sistema de Privacidade**: Links públicos e privados com controle granular
- **Autenticação**: Sistema completo com OAuth Google e autenticação tradicional
- **Busca e Filtros**: Busca por texto, filtros de privacidade e categorias
- **Sistema de Favoritos**: Marque links como favoritos para acesso rápido
- **Categorização**: Organize seus links por categorias customizáveis
- **Contador de Acesso**: Rastreie quantas vezes cada link foi acessado
- **Ordenação Customizável**: Ordene por data, alfabética, acessos ou categoria

### Interface e Experiência
- **Layout Responsivo**: Interface otimizada para desktop, tablet e mobile
- **Dark Mode**: Alternância entre modo claro e escuro com persistência
- **Internacionalização**: Suporte completo para português e inglês
- **Design Moderno**: Layout em grid com sidebar para melhor aproveitamento do espaço
- **Autopreenchimento**: Extração automática de metadados dos links

### Tecnologias
- **Backend**: Go com SQLite embarcado
- **Frontend**: Vue.js 3 com CSS Grid responsivo
- **Autenticação**: JWT + OAuth Google
- **Banco de Dados**: SQLite com migrações automáticas

## 🚀 Instalação e Uso

### 1. Executar o Servidor
```bash
go run main.go
# ou especificar porta:
go run main.go -port 3000
```

### 2. Acessar a Aplicação
Navegue para `http://localhost:8080`

### 3. Criar Conta
- Cadastre-se com usuário/senha
- Ou use login com Google (configuração opcional)

## ⚙️ Configuração

### OAuth Google (Opcional)
```bash
export GOOGLE_CLIENT_ID="seu-client-id"
export GOOGLE_CLIENT_SECRET="seu-client-secret"
export GOOGLE_REDIRECT_URL="http://localhost:8080/api/auth/google/callback"
```

### Configurar OAuth no Google
1. Acesse o [Google Cloud Console](https://console.developers.google.com/)
2. Crie um projeto e habilite a Google+ API
3. Crie credenciais OAuth 2.0
4. Adicione URI de redirecionamento: `http://localhost:8080/api/auth/google/callback`
5. Configure as variáveis de ambiente acima

## 📖 Como Usar

### Gerenciamento de Links
1. **Adicionar Link**: Insira URL, use auto-fill para metadados, adicione categoria
2. **Buscar**: Use a barra de busca para filtrar por URL, descrição ou tags  
3. **Filtrar**: Filtre por privacidade (público/privado/favoritos) ou categoria
4. **Ordenar**: Ordene por data, alfabética, mais acessados ou categoria
5. **Favoritos**: Clique em "Favorite" para marcar links importantes

### Interface
- **Desktop (1024px+)**: Layout em grid com sidebar e área principal
- **Mobile (<1024px)**: Layout em coluna única otimizado para toque
- **Dark Mode**: Alterne entre modo claro/escuro no header

## 🔧 API Endpoints

### Autenticação
- `POST /api/register` - Criar conta
- `POST /api/login` - Login usuário/senha  
- `GET /api/auth/google` - Login Google OAuth2
- `GET /api/auth/google/callback` - Callback OAuth2

### Gerenciamento de Links
- `GET /api/links` - Obter links do usuário (agrupados por data)
- `POST /api/links` - Adicionar novo link
- `DELETE /api/links/:id` - Excluir link
- `PUT /api/links/:id/favorite` - Alternar favorito
- `PUT /api/links/:id/access` - Incrementar contador de acesso

### Outros
- `GET /api/metadata?url=<URL>` - Extrair metadados de URL
- `GET /api/public-links` - Obter links públicos

## 💾 Banco de Dados

SQLite armazenado em `data/links.db` com tabelas:
- `users` - Contas de usuário (local + OAuth)  
- `links` - Links com metadados, privacidade, favoritos, categorias e contador de acesso

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
links/
├── main.go              # Servidor principal e roteamento
├── internal/
│   ├── auth/            # Autenticação JWT e OAuth
│   ├── db/              # Operações de banco de dados
│   ├── handlers/        # Handlers HTTP para API
│   ├── middleware/      # Middlewares (CORS, auth)
│   └── models/          # Modelos de dados
├── static/
│   ├── app.js           # Aplicação principal Vue.js
│   ├── login.js         # Página de login
│   ├── public.js        # Página de links públicos
│   ├── main.css         # Estilos CSS consolidados com dark mode
│   ├── assets/
│   │   └── js/          # Módulos JavaScript organizados
│   └── *.html          # Templates HTML
└── data/                # Banco SQLite e arquivos
```

### Dependências
Dependências mínimas para segurança e performance:
- `golang.org/x/crypto` - Hash de senhas
- `golang.org/x/oauth2` - OAuth2 Google
- `golang.org/x/net/html` - Parsing HTML seguro
- `modernc.org/sqlite` - Driver SQLite puro Go

### Build e Deploy
```bash
# Desenvolvimento
go run main.go

# Build de produção
go build -o links main.go

# Executar build
./links -port 8080
```

## 🔒 Recursos de Segurança

- **Validação de Entrada**: Validação e sanitização de URLs
- **Limites de Requisição**: Timeout, limites de tamanho, proteção redirect
- **Autenticação**: Todos os endpoints protegidos exceto auth
- **Parsing Seguro**: HTML parsing sem execução de código
- **Senhas Seguras**: Hashing bcrypt
- **CORS**: Configuração adequada para requisições cross-origin

## 🎨 Interface

Design focado em funcionalidade:
- Interface limpa sem ícones desnecessários
- Foco no conteúdo e usabilidade
- Design responsivo mobile/desktop
- Detecção automática de idioma
- Sugestões automáticas de metadados

## 📝 Licença

Projeto open source - sinta-se livre para usar e modificar.