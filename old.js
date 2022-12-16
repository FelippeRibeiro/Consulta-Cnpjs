const puppeteer = require("puppeteer");
const fs = require("fs");

const teste = require("./index.js");

teste();

(async () => {
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////DADOS////////////////////////////////////////////
  ////
  let cnpjLidos = fs
    .readFileSync("CNPJS.txt", "utf-8", (err, data) => {
      return data;
    })
    .split("\r\n"); ///DADOS DO TXT =2
  /////
  var cnpjs = [
    "03927907000199",
    "13937073000156",
    "34925854000109",
    "73849952000158",
  ]; //DADOS DIGITADOS AQUI MESMO =2
  //////////////////////////////////////////////DADOS////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  //ESCOLHENDO QUAL ESTRUTURA   O FOR VAI RODAR//
  let wich = 1; ///////// 1 OU 2
  let wichCnjp;
  if (wich == 1) {
    wichCnjp = cnpjLidos;
    console.log("Rodando pelo arquivo txt");
  } else if (wich == 2) {
    wichCnjp = cnpjs;
    console.log("Rodando pelo escopo do programa");
  }
  //ESCOLHENDO QUAL ESTRUTURA O FOR VAI RODAR//

  //REPETIÇÃO RODANDO COM BASE DO ARRAY DE CNPJS//
  for (let i = 0; i < wichCnjp.length; i++) {
    //INICIANDO PUPPETERR
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    //INICIANDO PUPPETERR//

    //INDO PARA PAGINA DO SEFAZ//
    await page.goto(
      "https://www.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp"
    );
    //INDO PARA PAGINA DO SEFAZ//

    //TRYCATCH PARA EVITAR CANCELAMENTO DO CODIGO OBS: TRATAR ERRO DE SELETOR NÃO ENCONTRADO E ABRIR TENTATIVA NA RECEITA FEDERAL//
    try {
      //
      //DEFININDO O CAMPO CNPJ COMO UMA CONSTANTE//
      const input = await page.waitForSelector(
        "body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > input"
      );
      //DEFININDO O CAMPO CNPJ COMO UMA CONSTANTE//

      //DIGITANDO O CNPJ COM SEU INDICE E CLICANDO PARA PESQUISAR//
      await input.type(wichCnjp[i]);
      await page.click(
        "body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(4) > input"
      );
      await delay(3000); //AGUARDANDO PARA PREVER FALHAS SERVIDOR DO SEFAZ//
      //DIGITANDO O CNPJ COM SEU INDICE E CLICANDO PARA PESQUISAR//

      //DEFININDO A SITUAÇÃO PARA UMA CONSTANTE E FORMATANDO//
      const situation = await page.$eval(
        "#Table7 > tbody",
        (el) => el.innerText
      );

      //Dados

      let resultFormated = situation
        .split("Situação Cadastral Vigente:")[1]
        .split(" ")[0]
        .replace("Data", "");

      const razao = await page.$eval(
        "#Table6 > tbody > tr:nth-child(4)",
        (el) => el.innerText
      );

      let result =
        // razao.replace("Micro Empreendedor Individual - MEI", "") +
        // " " +
        wichCnjp[i] + " " + resultFormated;

      console.log(result);

      //Ramo de atividade//
      let ramoAtv = await page.$eval("#Table7", (el) => el.innerText);

      let ramoformmate = ramoAtv
        .split("Atividade Econômica Principal:")[1]
        .split("Atividade Econômica Secundária");

      if (ramoformmate[0].length <= 150) {
        console.log(ramoformmate[0]);
      } else {
        ramoformmate = ramoAtv
          .split("Atividade Econômica Principal:")[1]
          .split("Unidade:");
        console.log(ramoformmate[0]);
      }

      //Ramo de atividade//

      //SITUAÇÃO E NOME DO CNPJ INDEX =  Razão Social: (nome)       (cnpj)  {Situação}

      //ESCREVENDO O RESULTADO EM UM TXT
      fs.appendFileSync(
        "Resultado.txt",
        `[ ${result} Ramo: ${ramoformmate[0]}];
    `
      );
      //ESCREVENDO O RESULTADO EM UM TXT
      //
    } catch (err) {
      console.log(wichCnjp[i] + " : erro de seletor");
      fs.appendFileSync(
        "Erros.txt",
        `${wichCnjp[i]}  erro de seletor
    `
      );
      //console.log(err);
    }
    //TRYCATCH PARA EVITAR CANCELAMENTO DO CODIGO OBS: TRATAR ERRO DE SELETOR NÃO ENCONTRADO E ABRIR TENTATIVA NA RECEITA FEDERAL//

    await browser.close();
  }
  //REPETIÇÃO RODANDO COM BASE DO ARRAY DE CNPJS//
})();
