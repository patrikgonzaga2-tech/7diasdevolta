# Desafio Volta ao Eixo 7D

App de entrega do Desafio Volta ao Eixo 7D (Comunidade Corpo Feliz): uma jornada guiada de 7 dias em uma única página web, pensada para celular.

## Como usar

É um único arquivo, `index.html`, com HTML, CSS e JavaScript, sem servidor e sem banco de dados. Para ver, abra o arquivo no navegador. Para publicar, hospede-o em qualquer serviço de site estático (GitHub Pages, Netlify, Vercel etc.).

O progresso fica salvo no aparelho (armazenamento local do navegador, chave `ve7d`). Com a planilha ligada, o app também envia para o Google Planilhas o cadastro (nome, WhatsApp, peso e medidas), os comentários, os motivos de "não consegui", os dias concluídos e o resultado final. Se a cliente estiver sem internet, os envios esperam numa fila e saem na próxima abertura.

As fotos de antes e depois ficam só no aparelho da cliente (IndexedDB) e aparecem lado a lado na tela de resultado.

Para ligar a planilha, siga [planilha/COMO-CONFIGURAR.md](planilha/COMO-CONFIGURAR.md).

## Regras dos dias

- Cada dia só abre depois que o anterior foi concluído.
- Para concluir um dia, a cliente marca os 3 passos.
- Se não conseguir, ela abre "Não consegui completar", escreve o motivo e faz 1 tarefa de recuperação no Kit. Isso conclui o dia e libera o próximo.
- No fim de cada dia há um campo de comentários, enviado para a planilha.
- Ao concluir o Dia 7, a cliente registra peso e medidas finais e vê a evolução (tabela e fotos lado a lado) antes do convite para a Comunidade.
- O cadastro pede nome, WhatsApp (o mesmo da compra), peso, medidas e a autorização de envio dos dados. As fotos de início são opcionais.

## O que dá para ajustar

Os itens ajustáveis da especificação ficam no objeto `CONFIG`, no começo do `<script>` em `index.html`:

- `sheetUrl`: link do App da Web do Apps Script (vazio = nada é enviado)
- `sheetKey`: chave que precisa ser igual a `CHAVE` em `planilha/Codigo.gs`
- `consentText`: texto da autorização de envio dos dados
- `poses`: as fotos pedidas (frente, lado, costas)
- `communityUrl`: link do botão "Conhecer a Comunidade Corpo Feliz"
- `days[n].videoUrl`: link da vídeo aula de cada dia (vazio mostra "EM BREVE"; preenchido, mostra o botão "Assistir à vídeo aula")
- `days[n]`: tema, subtítulo, título da vídeo aula, mensagem e os 3 passos de cada dia
- `days[n].audioDescription`: descrição curta do áudio do dia (vazio mostra "EM BREVE")
- `days[n].recoveryTask`: tarefa de recuperação do Kit, usada quando a cliente não completa os passos do dia
- `timerSeconds`: duração do cronômetro (600 = 10 minutos)
- `measures`: medidas pedidas no cadastro (nome, peso e medidas são obrigatórios para começar)
- `measureLessonUrl`: link da aula "Como tirar suas fotos e medidas" (vazio mostra "EM BREVE")
- `resetMessage`: mensagem de confirmação ao reiniciar
- `footer`: aviso educativo do rodapé

As cores, as fontes e a largura máxima (`--max-width`) ficam nas variáveis CSS em `:root` (modo claro) e em `@media (prefers-color-scheme: dark)` (modo escuro).

## Ainda reservado

Áudios da Profe Laura, aula de fotos e medidas, vídeo aulas, Ativações, aula bônus, conteúdo do Guia do Prato e as dicas do Kit Dia Imperfeito aparecem como espaço reservado até o conteúdo final ficar pronto (e ser revisado pelo responsável técnico).
