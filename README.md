# WebScraping_LegisladorWEB
Este é um projeto de Web Scraping na página [Legislador WEB](http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTramite&ID=20)


### Configurando o projeto
- Crie um arquivo `.env` baseado no arquivo `.env.example` e configure com as variáveis de ambiente necessárias
- Execute o comando `yarn start`
- Voilá, projeto rodando.

### Anotações importantes
- Este projeto segue o 3º princípio de uma 12-factor-application, então _as configurações ficam no ambiente_, utilizando a lib `dotenv` para ajudar com o gerenciamento de variáveis de ambiente
- Este projeto segue os princípios de cleancode do _AirBnb Styleguide_, configurado através do `eslint`
- Para manter as definições adequadas de formatação de código foi integrada a extensão `prettier` ao `eslint`
- Todas as configurações referentes ao editor de texto usado para produzir este código se encontram em `.editorconfig` e pode ser aplicado automáticamente à IDE de outros desenvolvedores usando a extensão `editorconfig`
