# 🗺️ Como Usar o Mapa de Imóveis

## ⚡ Início Rápido

### 1. Instalar Dependências
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Iniciar Aplicação
```bash
# Opção 1: Script de teste (recomendado)
./test-maps.sh

# Opção 2: Manual
npm start
```

### 3. Acessar o Mapa
1. Abra seu navegador em: **http://localhost:3000/buscar**
2. Clique no botão **"MAPA"** no canto superior direito
3. Pronto! O mapa vai carregar com os imóveis

---

## 📍 Funcionalidades do Mapa

### Visualização
- **Markers Azuis** 🔵: Imóveis normais
- **Markers Dourados** ⭐: Imóveis em DESTAQUE
- **Clusters** (círculos com números): Agrupamento de markers próximos

### Interações
1. **Click em Cluster**: Expande e mostra os markers individuais
2. **Click em Marker**: Abre popup com:
   - Foto do imóvel
   - Título e preço
   - Localização (bairro, cidade)
   - Número de quartos e área
   - Botão WhatsApp para contato direto

3. **Zoom**: Use a roda do mouse ou os botões + / -
4. **Arrastar**: Clique e arraste para mover o mapa

### Filtros
Os filtros da busca funcionam TAMBÉM no mapa:
- Texto livre
- Tipo de imóvel
- Cidade
- Número de quartos
- Faixa de preço
- Ordenação

**Ao aplicar um filtro, o mapa atualiza automaticamente!**

---

## 🏠 Dados de Exemplo

O arquivo `data/properties.json` contém **8 imóveis de exemplo** em São Paulo com coordenadas reais:

1. **Casa Moderna** - Avenida Paulista (Destaque ⭐)
2. **Apartamento 2 Quartos** - Rua Augusta
3. **Sobrado 4 Quartos** - Pinheiros (Destaque ⭐)
4. **Kitnet Mobiliada** - Centro
5. **Cobertura Duplex** - Moema (Destaque ⭐)
6. **Casa em Condomínio** - Vila Mariana
7. **Apartamento Cobertura** - Jardins (Destaque ⭐)
8. **Casa Comercial** - Itaim Bibi

Todos têm:
- ✅ Latitude e longitude válidas
- ✅ Endereço completo
- ✅ Fotos (via Unsplash)
- ✅ Preços realistas
- ✅ Contato WhatsApp

---

## 🔧 Resolução de Problemas

### O mapa não carrega?

**1. Verifique se os imóveis têm latitude/longitude:**
```bash
cat data/properties.json | grep -o '"latitude"' | wc -l
```
Deve mostrar 8 (ou o número de imóveis cadastrados).

**2. Abra o Console do Navegador (F12):**
- Vá em Console
- Procure por erros em vermelho
- Erros comuns:
  - `L is not defined`: Leaflet não carregou → Recarregue a página
  - `Cannot read property 'addLayer'`: Mapa não inicializou → Troque para Grade e volte para Mapa

**3. Limpe o cache:**
- Chrome/Edge: Ctrl+Shift+Del → Limpar cache
- Recarregue com Ctrl+F5

**4. Verifique se o build está atualizado:**
```bash
cd frontend
npm run build
cd ..
npm start
```

### Os markers não aparecem?

**Causa mais comum**: Imóveis sem latitude/longitude.

**Solução**: Ao cadastrar um imóvel novo:
1. Preencha o CEP
2. Sistema preenche endereço automaticamente
3. Adicione latitude e longitude manualmente OU
4. Use o painel admin para editar e adicionar coordenadas

**Para obter coordenadas:**
- Google Maps: Click direito no local → "O que há aqui?"
- Copie as coordenadas (ex: -23.550520, -46.633308)

### O mapa está lento?

**Normal!** O marker clustering ajuda, mas com muitos imóveis pode demorar.

**Dicas**:
- Use filtros para reduzir a quantidade
- Zoom out agrupa em clusters (mais rápido)
- Zoom in mostra markers individuais

---

## 🎯 Diferenças do Projeto Original

A implementação Angular é **IDÊNTICA** ao projeto vanilla JS:

| Feature | Original | Angular | Status |
|---------|----------|---------|--------|
| Leaflet Map | ✅ | ✅ | Idêntico |
| Marker Clustering | ✅ | ✅ | Idêntico |
| Ícones Dourados (Destaque) | ✅ | ✅ | Idêntico |
| Popups com Foto | ✅ | ✅ | Idêntico |
| Botão WhatsApp no Popup | ✅ | ✅ | Idêntico |
| Auto-zoom | ✅ | ✅ | Idêntico |
| Spiderfy (expandir cluster) | ✅ | ✅ | Idêntico |
| Filtros funcionam no mapa | ✅ | ✅ | Idêntico |

---

## 📱 Página de Detalhes do Imóvel

Além do mapa de busca, cada imóvel tem seu próprio mapa:

1. Clique em qualquer **card de imóvel**
2. Você vai para `/imovel/:id`
3. Na página de detalhes, role até o mapa
4. Verá um marker no endereço exato
5. Click em "Abrir no Google Maps" para navegação

---

## 💡 Dicas para Uso

### Para Usuários
- Use o mapa para ter noção de localização
- Clusters mostram densidade de imóveis por região
- Popups tem link direto para WhatsApp

### Para Administradores
- Sempre preencha latitude/longitude ao cadastrar
- Marque imóveis importantes como "Destaque" (aparecem dourados)
- Use CEP auto-fill para facilitar preenchimento de endereço

### Para Desenvolvedores
- Leaflet + Leaflet.markercluster estão em `package.json`
- CSS do Leaflet está em `index.html`
- Código do mapa está em `frontend/src/app/pages/search/search.ts`
- Configuração de ícones está no `ngAfterViewInit()`

---

## 🆘 Suporte

Se o mapa AINDA não funcionar após seguir este guia:

1. Tire um print do console (F12 → Console)
2. Tire um print da aba Network (F12 → Network)
3. Verifique se o servidor está rodando (deve aparecer "Servidor rodando na porta 3000")
4. Verifique se o arquivo `data/properties.json` existe e tem imóveis

**Comando de diagnóstico:**
```bash
# Verifica tudo
echo "=== Diagnóstico ===" && \
ls -la data/properties.json && \
echo "Imóveis: $(cat data/properties.json | grep -o '"id"' | wc -l)" && \
echo "Com localização: $(cat data/properties.json | grep -o '"latitude"' | wc -l)" && \
ls -la frontend/dist/frontend/browser/index.html 2>/dev/null && \
echo "Build: OK" || echo "Build: FALTANDO (execute: cd frontend && npm run build)"
```

---

## ✅ Checklist de Funcionamento

- [ ] Servidor rodando (`npm start` ou `./test-maps.sh`)
- [ ] Build do Angular existe (`frontend/dist/frontend/browser/`)
- [ ] Arquivo de dados existe (`data/properties.json`)
- [ ] Imóveis têm latitude/longitude
- [ ] Página abre em http://localhost:3000/buscar
- [ ] Botão "MAPA" visível no topo
- [ ] Click em "MAPA" mostra o mapa
- [ ] Markers aparecem no mapa
- [ ] Click em marker abre popup
- [ ] Popup tem foto, título, preço, botão WhatsApp

Se TODOS os itens acima estiverem ✅, o mapa está funcionando perfeitamente!

---

**Última atualização**: 2024-11-16  
**Versão**: Angular 19 + Leaflet 1.9.4 + MarkerCluster 1.4.1
