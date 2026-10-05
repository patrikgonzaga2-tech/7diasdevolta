# Como ligar a planilha ao app

O app envia os dados de cada cliente para uma planilha do Google: cadastro, comentários, motivos de "não consegui", dias concluídos e resultado final. Isso leva uns 10 minutos e só precisa ser feito uma vez.

Use a conta Google da equipe (não uma conta pessoal), porque é ela que vai guardar os dados das clientes.

## Parte 1: Criar a planilha

1. Abra **https://sheets.new**. Uma planilha em branco é criada.
2. Clique no título "Planilha sem título", no canto de cima, e dê o nome **Volta ao Eixo 7D: Clientes**.

## Parte 2: Colar o script

1. Na planilha, clique no menu **Extensões** e depois em **Apps Script**. Uma nova aba se abre.
2. Do lado esquerdo vai aparecer um arquivo chamado **Código.gs**, com um texto `function myFunction() {...}`. Apague todo esse texto.
3. Abra o arquivo **https://github.com/patrikgonzaga2-tech/7diasdevolta/blob/claude/app-from-file-g0j8ys/planilha/Codigo.gs**, clique no botão de copiar (ícone de duas folhas, no canto direito acima do código) e cole no lugar do texto que você apagou.
4. Clique no ícone de **disquete** (Salvar projeto), no topo.

## Parte 3: Criar as abas

1. Ainda no Apps Script, na barra de cima, ao lado de "Depurar", tem uma lista de funções. Escolha **prepararPlanilha** e clique em **Executar**.
2. O Google vai pedir autorização:
   - Clique em **Revisar permissões** e escolha a conta da equipe.
   - Se aparecer "O Google não verificou este app", clique em **Avançado** e depois em **Acessar Volta ao Eixo (não seguro)**. Isso é normal para scripts feitos por você mesmo.
   - Clique em **Permitir**.
3. Volte para a aba da planilha. Agora ela tem as abas **Clientes**, **Registros** e **Compras**.

## Parte 4: Publicar o script para o app conseguir enviar

1. No Apps Script, clique no botão azul **Implantar** (canto superior direito) e depois em **Nova implantação**.
2. Clique na engrenagem ao lado de "Selecionar tipo" e escolha **App da Web**.
3. Preencha:
   - **Descrição:** `App Volta ao Eixo`
   - **Executar como:** **Eu** (a conta da equipe)
   - **Quem pode acessar:** **Qualquer pessoa**
4. Clique em **Implantar**.
5. Copie o **URL do app da Web**. Ele começa com `https://script.google.com/macros/s/` e termina com `/exec`.
6. **Mande esse link para o Claude** (ou para quem cuida do app). Ele vai no campo `sheetUrl` do `index.html`. A partir daí, o app começa a enviar os dados.

Para conferir se deu certo, abra esse link no navegador. Deve aparecer a frase "Volta ao Eixo: planilha conectada."

## O que aparece em cada aba

**Clientes**: uma linha por cliente, identificada pelo WhatsApp.
WhatsApp, nome, data da compra, data do cadastro, peso e medidas iniciais, dias concluídos, dias com recuperação, último dia concluído, se concluiu os 7 dias, última atividade, peso e medidas finais, diferenças e data do resultado.

**Registros**: uma linha por acontecimento, com data e hora, WhatsApp, nome, data da compra, dia e tipo:
- **Comentário do dia**: o que ela escreveu em "Comentários do Dia N". Se ela editar, a mesma linha é atualizada.
- **Não consegui completar**: o motivo que ela escreveu. Também é atualizado na mesma linha.
- **Dia concluído**, **Dia concluído com recuperação** ou **Dia desmarcado**.
- **Cadastro** e **Resultado final**, com peso e medidas.

Dica: em **Registros**, use **Dados → Criar um filtro** para ver só um tipo (por exemplo, só "Não consegui completar") ou só uma cliente.

**Compras**: é onde entra a **data de compra**. O app não sabe quando a cliente comprou; essa informação vem do checkout. Exporte o relatório de vendas da plataforma (Hotmart, Kiwify etc.) e cole nas colunas:

| WhatsApp | Nome | E-mail | Data da compra | Produto | Observação |
|---|---|---|---|---|---|

Assim que você cola, o script preenche a "Data da compra" nas abas Clientes e Registros, comparando pelo WhatsApp. O número pode estar em qualquer formato (`+55 11 98888-7777`, `11988887777`, com ou sem o 9). Se precisar forçar, use o menu **Volta ao Eixo → Atualizar datas de compra**, que aparece no topo da planilha.

## Sobre as fotos

As fotos **não vão para a planilha**. Elas ficam guardadas só no celular da cliente e aparecem lado a lado na tela de resultado. Isso protege as clientes, já que são fotos do corpo, e evita guardar imagens sensíveis numa planilha que várias pessoas da equipe abrem.

## Se mudar o script depois

Depois de qualquer alteração no código, vá em **Implantar → Gerenciar implantações**, clique no lápis, escolha **Nova versão** em "Versão" e clique em **Implantar**. O link continua o mesmo.

## Cuidados com os dados (LGPD)

Peso e medidas são dados pessoais de saúde. Por isso:
- O app só envia os dados depois que a cliente marca a autorização no cadastro.
- Compartilhe a planilha só com quem realmente precisa acompanhar as clientes.
- Se uma cliente pedir para apagar os dados dela, apague as linhas dela nas abas Clientes, Registros e Compras.
