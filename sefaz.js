const puppeteer = require("puppeteer");
const fs = require("fs");

async function sefazScrap(cnpj) {
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp"
  );

  try {
    const input = await page.waitForSelector(
      "body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > p > input"
    );

    await input.type(cnpj);
    await page.click(
      "body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(4) > input"
    );
    await delay(3000);

    const situation = await page.$eval("#Table7 > tbody", (el) => el.innerText);

    let resultFormated = situation
      .split("Situação Cadastral Vigente:")[1]
      .split(" ")[0]
      .replace("Data", "")
      .split("\n\t\t\t\t")[0];

    const razao = await page.$eval(
      "#Table6 > tbody > tr:nth-child(4)",
      (el) => el.innerText
    );

    let result = `${cnpj} ${resultFormated}`;

    let ramoAtv = await page.$eval("#Table7", (el) => el.innerText);

    let ramoformmate = ramoAtv
      .split("Atividade Econômica Principal:")[1]
      .split("Atividade Econômica Secundária");

    function rRamo() {
      if (ramoformmate[0].length <= 150) {
        return ramoformmate[0].split(" ")[0];
      } else {
        ramoformmate = ramoAtv
          .split("Atividade Econômica Principal:")[1]
          .split("Unidade:");
        return ramoformmate[0].split(" ")[0];
      }
    }

    let ramo = rRamo().split("\n")[1];

    await browser.close();
    return `${result} ${ramo}`;
  } catch (err) {
    await browser.close();
    return `${cnpj} Erro inesperado`;
  }
}

module.exports = sefazScrap;
