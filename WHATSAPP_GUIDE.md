# WhatsApp-like Chat Interface

## 📱 Sobre

Esta é uma interface de chat estilo WhatsApp criada com HTML, CSS e JavaScript puro. Não requer nenhuma instalação ou dependência externa.

## 🚀 Como Usar

1. Abra o arquivo `chat.html` em qualquer navegador moderno (Chrome, Firefox, Safari, Edge)
2. Digite sua mensagem no campo de entrada na parte inferior
3. Clique no botão de enviar (verde) ou pressione Enter
4. Veja sua mensagem aparecer no chat
5. Aguarde uma resposta automática!

## ✨ Recursos

- **Tema Escuro**: Design moderno do WhatsApp
- **Mensagens Interativas**: Digite e envie mensagens em tempo real
- **Resposta Automática**: Simula uma conversa real
- **Design Responsivo**: Funciona perfeitamente em celular e desktop
- **Confirmações de Leitura**: Checkmarks azuis nas mensagens enviadas
- **Timestamps**: Horário em cada mensagem
- **Animações Suaves**: Experiência visual agradável

## 🎨 Personalização

### Alterar Foto de Perfil
No arquivo `chat.html`, linha 14, altere a URL:
```html
<img src="SUA_URL_AQUI" alt="Paulo" class="profile-pic">
```

### Alterar Nome
No arquivo `chat.html`, linha 16, altere o texto:
```html
<h3>Seu Nome</h3>
```

### Alterar Mensagens Iniciais
Edite as divs com classe `message` no arquivo `chat.html` entre as linhas 30-90.

### Personalizar Cores
No arquivo `chat-style.css`, você pode alterar:
- Cor de fundo: linha 73 (`background-color: #0b141a`)
- Cor das mensagens enviadas: linha 118 (`background-color: #005c4b`)
- Cor das mensagens recebidas: linha 123 (`background-color: #1f2c33`)

## 📱 Compatibilidade

- ✅ Chrome/Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)
- ✅ Opera (versão 76+)

## 🔧 Tecnologias

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript (ES6+)
- SVG (ícones)

## 📝 Estrutura de Arquivos

```
├── chat.html          # Estrutura HTML principal
├── chat-style.css     # Estilos do WhatsApp
├── chat-script.js     # Funcionalidades interativas
└── WHATSAPP_GUIDE.md  # Este arquivo
```

## 💡 Dicas

- Use emojis nas suas mensagens! 😊 🚀 ❤️
- Pressione Enter para enviar rapidamente
- Role a tela para ver mensagens anteriores
- Funciona sem internet após carregamento inicial

## 🐛 Problemas Conhecidos

- A foto de perfil pode não carregar se houver bloqueadores de conteúdo
- Auto-resposta é simulada (não é uma IA real)

## 📄 Licença

Livre para uso pessoal e educacional.

---

Criado com ❤️ por Paulo
