const puppeteer = require("puppeteer");
const fs = require("fs");
const sefaz = require("./sefaz");

async function bizJs() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let cnpjs = fs
    .readFileSync("CNPJS.txt", "utf-8", (err, data) => {
      return data;
    })
    .split("\r\n");

  for (let i = 0; i < cnpjs.length; i++) {
    try {
      await page.goto("https://cnpj.biz/" + cnpjs[i]);
      let result = await page.$eval(
        "body > div.container > div.hero > div",
        (el) => el.innerText
      );

      let situation = result
        .split("Situação:")[1]
        .split("Data Situação Cadastral:")[0];

      let cnae = result
        .split("Atividades - CNAES")[1]
        .split("Secundária(s):")[0]
        .substring(11, 23)
        .replace(".", "")
        .replace("-", "")
        .replace("-", "")
        .replace(" ", "");

      function escreverResult() {
        let $result;
        if (situation.includes("Ativa")) {
          $result = `${cnpjs[i]} Ativo ${cnae}\n`;
        } else if (situation.includes("Inapta")) {
          $result = `${cnpjs[i]} Inapto ${cnae}\n`;
        } else if (situation.includes("Baixada")) {
          $result = `${cnpjs[i]} Baixado ${cnae}\n`;
        }
        return $result;
      }
      fs.appendFileSync("ResultadoBiz.txt", escreverResult());
    } catch (error) {
      console.log(cnpjs[i] + " erro inesperado. Iniciando sefaz");
      try {
        fs.appendFileSync("ResultadoBiz.txt", `${await sefaz(cnpjs[i])}\n`);
      } catch (error) {
        fs.appendFileSync("ResultadoBiz.txt", `${cnpjs[i]} Erro inesperado\n`);
      }
    }
  }
  console.log("Finalizado " + cnpjs.length + " Cnpjs");
  await browser.close();
}
bizJs();

module.exports = bizJs;
