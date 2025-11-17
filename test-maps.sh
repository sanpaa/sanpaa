#!/bin/bash

echo "🏠 Teste do Sistema de Mapas - Imobiliária"
echo "=========================================="
echo ""

# Verificar se os dados existem
if [ ! -f data/properties.json ]; then
    echo "❌ Arquivo data/properties.json não encontrado!"
    echo "   Execute este script novamente para criar os dados de exemplo."
    exit 1
fi

echo "✅ Dados carregados: $(cat data/properties.json | grep -o '"id"' | wc -l) imóveis cadastrados"
echo ""

# Contar imóveis com localização
PROPERTIES_WITH_LOCATION=$(cat data/properties.json | grep -o '"latitude"' | wc -l)
echo "✅ Imóveis com localização (lat/long): $PROPERTIES_WITH_LOCATION"
echo ""

# Build do Angular
echo "🔨 Compilando aplicação Angular..."
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build. Executando com output:"
    npm run build
    exit 1
fi
cd ..

echo ""
echo "🚀 Iniciando servidor..."
echo ""
echo "Acesse a aplicação em: http://localhost:3000"
echo ""
echo "📍 TESTAR O MAPA:"
echo "   1. Abra http://localhost:3000/buscar"
echo "   2. Clique no botão 'MAPA' no topo à direita"
echo "   3. Você deve ver $PROPERTIES_WITH_LOCATION markers no mapa"
echo "   4. Markers dourados (⭐) são imóveis em DESTAQUE"
echo "   5. Markers azuis são imóveis normais"
echo "   6. Click em cluster (números) para expandir"
echo "   7. Click em marker para ver detalhes"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo "=========================================="
echo ""

# Iniciar servidor
npm start
