0 - Descreva brevemente o propósito das alterações em cada arquivo.

1 - O código atende aos requisitos especificados no ticket/tarefa (Jira)

2 - Casos de borda foram tratados (ex: valores nulos, listas vazias, números negativos)?

3 - Erros e exceções são tratados de forma graciosa (mensagens amigáveis para o usuário final, fallbacks nas exceções)?

4 - Nomenclatura: Variáveis, funções e classes têm nomes descritivos (ex: calcularPrecoTotal vs calc)?

5 - Código Morto: Removeu console.log, código comentado (desnecessários) e importações não utilizadas?

6 - Você adicionou testes unitários para a nova lógica?

7 - Os testes existentes ainda passam?

8 - Você verificou manualmente as alterações em um ambiente local/staging?

9 - Há segredos/chaves de API hardcoded (não atribuir valores fixos nas variáveis, utilizar um gerenciador de segredos ou variáveis de ambiente)?

10 - Há operações custosas dentro de loops (ex: queries de BD, chamadas de API, mudanças de estados, processamentos automáticos)?

11 - README/Documentação foi atualizado se houver mudanças de arquitetura/processos/features?
