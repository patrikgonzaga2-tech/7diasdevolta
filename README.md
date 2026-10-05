# Desafio Volta ao Eixo 7D

App de entrega do Desafio Volta ao Eixo 7D (Comunidade Corpo Feliz): uma jornada guiada de 7 dias em uma única página web, pensada para celular.

## Como usar

É um único arquivo, `index.html`, com HTML, CSS e JavaScript, sem servidor e sem banco de dados. Para ver, abra o arquivo no navegador. Para publicar, hospede-o em qualquer serviço de site estático (GitHub Pages, Netlify, Vercel etc.).

O progresso (nome, dias concluídos e passos marcados) fica salvo só no aparelho, no armazenamento local do navegador, com a chave `ve7d`.

## O que dá para ajustar

Os itens ajustáveis da especificação ficam no objeto `CONFIG`, no começo do `<script>` em `index.html`:

- `communityUrl`: link do botão "Conhecer a Comunidade Corpo Feliz"
- `days[n].videoUrl`: link da vídeo aula de cada dia (vazio mostra "EM BREVE"; preenchido, mostra o botão "Assistir à vídeo aula")
- `days[n]`: tema, subtítulo, título da vídeo aula, mensagem e os 3 passos de cada dia
- `timerSeconds`: duração do cronômetro (600 = 10 minutos)
- `defaultName`: nome usado quando o campo fica vazio
- `resetMessage`: mensagem de confirmação ao reiniciar
- `footer`: aviso educativo do rodapé

As cores, as fontes e a largura máxima (`--max-width`) ficam nas variáveis CSS em `:root` (modo claro) e em `@media (prefers-color-scheme: dark)` (modo escuro).

## Ainda reservado

Áudios da Profe Laura, vídeo aulas, Ativações, aula bônus, conteúdo do Guia do Prato e as dicas do Kit Dia Imperfeito aparecem como espaço reservado até o conteúdo final ficar pronto (e ser revisado pelo responsável técnico).
