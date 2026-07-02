# AnalyzeFat - Liga do Ferro

Um aplicativo web de alta performance para monitoramento de treinos de musculação, progressão de cargas, análise de volume e gamificação esportiva.

## 🚀 Funcionalidades Principais
- 🟢 **Treino ao Vivo (Sticky Bar):** Mini-player fixo com cronômetro em tempo real, temporizador de descanso e volume total acumulado.
- 🗓️ **Matriz de Consistência (Heatmap):** Visualização de consistência diária nos últimos 60 dias (estilo GitHub e Whoop).
- ⚖️ **Força Relativa & Réguas de Nível:** Padrão esportivo baseado na relação Carga ÷ Peso Corporal (Iniciante, Intermediário, Avançado e Elite).
- 🏆 **Ranks & Conquistas (Badges):** Sistema de gamificação com ganho de XP, patentes (do Ferro à Elite) e insígnias desbloqueáveis.
- 📈 **Linha do Tempo da Força:** Gráfico de evolução mensal e tonelagem total levantada nas últimas 4 semanas com identificação de pico.
- 🏷️ **Biblioteca & Fichas Rápidas:** Organização inteligente por treinos A, B, C e D, criação de exercícios customizados e cálculo automático de 1RM estimado.

## 🛠️ Tecnologias Utilizadas
- **React + Vite** (JavaScript moderno e alta performance)
- **CSS Vanilla / Custom Variables** (Design escuro grafite/chumbo com destaques em dourado opaco `#d4af37`, sem efeitos brilhantes/neon)
- **State Management & Local Persistence** (Sincronização de dados, treinos e rotinas personalizadas via LocalStorage)

## 📦 Como Executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Para gerar a build de produção:
   ```bash
   npm run build
   ```
