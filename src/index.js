const puppeteer = require('puppeteer');

const extractProjectURLsFrom = async (page) => {
  const extractedURLs = await page.evaluate(() => {
    const createURLs = (string) => {
      const data = string.replace(/WinProjetoTXT\(|\)|\'/gi,'').split(',');

      return formatedURL = `http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTexto&ID=${data[0]}&INEspecie=${data[1]}&nrProjeto=${data[2]}&aaProjeto=${data[3]}`;
    }

    const extractedData = [];

    const projects = document.querySelectorAll('div.card');
    for (const project of projects) {
      extractedData.push({
        url: createURLs(project.querySelector('.btn-outline-secondary').getAttribute('onclick').split(';')[0])
      });
    }

    return extractedData;
  });

  return extractedURLs;
}


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://www.legislador.com.br/LegisladorWEB.ASP?WCI=ProjetoTramite&ID=20');
  await page.screenshot({path: './example.png'});

  const searchPhrase = 'transporte';
  await page.click("input[name=dsTexto]");
  await Promise.all([
    page.type("input[name=dsTexto]", searchPhrase + String.fromCharCode(13)),
    // page.click("button[name=Navegar]"),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  // await page.click("#idPesquisarVerbete");

  const extractedURLs = await extractProjectURLsFrom(page);

  extractedURLs2 = extractedURLs.slice(0, 3);

  let finalData = [];
  let cont = 0;
  const results = extractedURLs2.map(async project => {
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

  Promise.all(results).then(async data => {
    await browser.close();
    console.log('Busca concluída! :D');
    console.log(finalData);
  });

})();
