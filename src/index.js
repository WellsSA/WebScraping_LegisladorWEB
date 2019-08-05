require('./config/mongodb');
const puppeteer = require('puppeteer');
const Storage = require('./database/schemas/TramiteProjetos');
/**
 * @description função responsável por retornar as URLs dos devidos projetos da página Legislador WEB
 * @param {page} page
 * @returns {Object Array} extractedURLs[{url: ''}]
 */
const extractProjectURLsFrom = async (page) => {
  // evaluate executa código javascript na página desejada
  const extractedURLs = await page.evaluate(() => {
    /**
     * @description função interna que converte as funções de carregamento (WinProjetoTXT) em URLs formatadas
     * @param {string} string
     * @returns {string} formatedURL= 'url'
     */
    const createURLs = (string) => {
      const data = string.replace(/WinProjetoTXT\(|\)|\'/gi,'').split(',');

      return formatedURL = `http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTexto&ID=${data[0]}&INEspecie=${data[1]}&nrProjeto=${data[2]}&aaProjeto=${data[3]}`;
    }

    const extractedData = [];

    // percorre a div principal obtendo os projetos
    const projects = document.querySelectorAll('div.card');
    // itera sobre os projetos obtidos para extrair as funções de ativação de cada projeto
    for (const project of projects) {
      //adiciona as funcões formatadas como URLs funcionais usando o método acima
      extractedData.push({
        url: createURLs(project.querySelector('.btn-outline-secondary').getAttribute('onclick').split(';')[0])
      });
    }
    // retorno evaluate
    return extractedData;
  });
  // retorno extractProjectURLsFrom
  return extractedURLs;
}
/**
 * @description função responsável por fazer a busca na API LegisladorWeb
 * @param {string} phrase a palavra-chave de busca. ex: 'transporte'
 * @returns {Object Array} extractedprojects
 */
const search = async (phrase) => {
  // acessa a página em questão
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTramite&ID=20');

  // verifica se é necessário fazer a busca pela palavra chave ou não
  if(phrase !== '') {
    const searchPhrase = phrase;
    await page.click("input[name=dsTexto]");
    await Promise.all([
      page.type("input[name=dsTexto]", searchPhrase + String.fromCharCode(13)),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
  }
  // extrai as URLs existentes na página
  const extractedURLs = await extractProjectURLsFrom(page);

  let finalData = [];
  let cont = 0;
  // percorre as URLs para obter as informações de cada projeto encontrado
  const results = extractedURLs.map(async project => {
    console.log(`Projetos encontrados: ${++cont} ...`);
    try{
      const page = await browser.newPage();
      const { url } = project;
      await page.goto(url);
      finalData.push(await page.evaluate(() => ({
        titulo: document.querySelector('.card-title').innerHTML,
        data: document.querySelector('.card-subtitle').innerHTML.replace('de ', ''),
        situacao: document.querySelectorAll('dd.col-sm-9')[0].innerHTML,
        assunto: document.querySelectorAll('dd.col-sm-9')[3].innerHTML,
        autor: document.querySelectorAll('dd.col-sm-9')[4].innerHTML.replace(/<br>|<\/b>/gi,'').replace('<b>', ' - '),
        ementa: document.querySelector('.card-text').innerHTML.replace(/&nbsp;/gi, ''),
        tramite: document.querySelectorAll('dd.col-sm-9')[1].innerHTML,
      })));

      console.log('Carregando ' + url.slice(url.indexOf('nrProjeto=')) + '...');
    } catch(e){
      console.log('Erro encontrado: ', e)
    }

    return true;
  });
  // aguarda todo o processamento do .map ser concluído antes de avançar
  await Promise.all(results).then(async data => {
    await browser.close();
    console.log('Busca concluída! :D');
    console.log(finalData);
  });

  return finalData;
}
/**
 * @description função responsável por fazer o salvamento das informações no banco de dados MongoDB
 * @param {Object Array} projects a palavra-chave de busca. ex: 'transporte'
 */
const store = async projects => {
  console.log('Salvando no MongoDB...')
  await Promise.all(projects.map(async project => {
    const { titulo } = project;
    try{
      await Storage.findOneAndUpdate({ titulo }, project, { upsert: true });
      console.log(`Projeto ${titulo} Salvo com sucesso!`);
    } catch(e) {
      console.log(`Falha ao salvar o projeto ${titulo} no MongoDB...`, e);
    }
  }));
}

// CLI
(async () => {
  // se o usuário precionar a opção -h || --help
  if(process.argv.findIndex(arg => arg === '-h' || arg === '--help') !== -1)
    return console.log(`Options:
      -s [valor], --search         extrair os resultados da busca por palavra-chave`)

  // se o usuário enviar os parametros a opção -s || --search
  let phrase = '';
  const cliSearch = process.argv.findIndex(arg => arg === '-s' || arg === '--search');
  if(cliSearch !== -1) phrase = process.argv[cliSearch + 1];

  // faz a consulta e salva no banco
  const searchResults = await search(phrase);
  await store(searchResults);

  process.exit(0);
})();

/**
 * @exports { search, store } methods
 */
 module.exports = { search, store };
