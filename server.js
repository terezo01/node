const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 3001;

const carrosPath = path.join(__dirname, 'carros.json');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let carrosData = fs.readFileSync(carrosPath, 'utf-8');
let carros = JSON.parse(carrosData);

function salvarDados(){
    fs.writeFileSync(carrosPath, JSON.stringify(carros, null, 2));
}

function posPesquisa(res, frase){
    res.send(`<h1>${frase}</h1><br>
    <a href="/adicionar-carro">Adicionar carros</a><br>
    <a href="/buscar-carro">Buscar por carros</a><br>
    <a href="/categoria-carro">Buscar por Categoria</a><br>
    <a href="/todos-tabela">Todos os carros</a><br>
    <a href="/atualizar-carro">Atualizar cadastro</a><br>
    <a href="/deletar-carro">Deletar carro</a>`)
}

app.get('/index', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/index.html'));
}) 

app.get('/atualizar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/atualizar-carro.html'));
}) 

app.post('/atualizar-carro', (req, res) =>{
    const { nome, novaCategoria, novaDesc, novaUrlFoto} = req.body

    const carroIndex = carros.findIndex(carro => carro.nome.toLowerCase() === nome.toLowerCase());

    if(carroIndex === -1){
        posPesquisa(res, "Carros não encontrados")
        return
    }

    carros[carroIndex].categoria = novaCategoria
    carros[carroIndex].desc = novaDesc
    carros[carroIndex].urlFoto = novaUrlFoto

    salvarDados();

    posPesquisa(res, "Carro atualizado com sucesso!")

})

app.get('/adicionar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/adicionar-carro.html'));
}) 

app.post('/adicionar-carro', (req, res) => {
    const novocarro = req.body;

    if (carros.find(carro => carro.nome.toLowerCase() === novocarro.nome.toLowerCase())) {
        res.send('<h1> Esse nome de carro já existe. Não é possivel adicionar duplicatas. </h1>');
        return;
    }

    carros.push(novocarro);

    salvarDados();

    posPesquisa(res, "Carro adicionado com sucesso!")
});


app.get('/deletar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/deletar-carro.html'));
})

app.post('/deletar-carro', (req, res) =>{
    const{nome} = req.body;
   
    const carroIndex = carros.findIndex(carro => carro.nome.toLowerCase() === nome.toLowerCase());
   
    if(carroIndex === -1){
        posPesquisa(res, "Carro não encontrado")
        return;
    }
    else{
        carros.splice(carroIndex, 1);
        salvarDados();
        posPesquisa(res, `O carro ${nome} foi excluido`) 
    }
   
});

function buscarcarroPorNome(nome) {

    return carros.find(carro => carro.nome.toLowerCase() === nome.toLowerCase())
}

app.get('/buscar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/buscar-carro.html'));
}) 

app.get('/buscar-carro/:nome', (req, res) =>{
    const nomeBuscado = req.params.nome

    const carroEncontrado = buscarcarroPorNome(nomeBuscado)

    if (carroEncontrado) {
        const templatePath = path.join(__dirname, '/html/dados-carro.html');
        const templateData = fs.readFileSync(templatePath, 'utf-8')
        const html = templateData.replace(
            '<div class="card-body"></div>', 
            `<div class="card-body"><p class="cardtext"><strong>Nome:</strong>${carroEncontrado.nome}</p>
            <p class="cardtext"><strong>Categoria:</strong>${carroEncontrado.categoria}</p>
            <p class="cardtext"><strong>Descrição:</strong>${carroEncontrado.desc}</p> <br></div>`
        );
        res.send(html);
    } else {
        posPesquisa(res, "Carros não encontrados")
    }
})

app.post('/buscar-carro', (req, res) => {
    const nomeBuscado = req.body.nome

    const carroEncontrado = buscarcarroPorNome(nomeBuscado);

    if (carroEncontrado) {
        const templatePath = path.join(__dirname, '/html/dados-carro.html');
        const templateData = fs.readFileSync(templatePath, 'utf-8')
        const html = templateData.replace(
            '<div class="card-body"></div>', 
            `<div class="card-body"><p class="cardtext"><strong>Nome:</strong>${carroEncontrado.nome}</p>
            <p class="cardtext"><strong>Categoria:</strong>${carroEncontrado.categoria}</p>
            <p class="cardtext"><strong>Descrição:</strong>${carroEncontrado.desc}</p> <br></div>`
        );
        res.send(html);
    } else {
        posPesquisa(res, "Carros não encontrados")
    }
});



function buscarcarroPorCategoria(categoria) {
    let categoriascarros = ""; 

    carros.forEach(carro => {
        if(carro.categoria.toLowerCase() === categoria.toLowerCase()){
            categoriascarros += 
            `<p class="cardtext"><strong>Nome:</strong>${carro.nome}</p>
            <p class="cardtext"><strong>Categoria:</strong>${carro.categoria}</p>
            <p class="cardtext"><strong>Descrição:</strong>${carro.desc}</p> <br>`;
        console.log(categoriascarros)
        }
    });

    return categoriascarros; 
}

app.get('/categoria-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/categoria-carro.html'));
}) 

app.post('/categoria-carro', (req, res) => {
    
    const nomeCategoriaBuscada = req.body.categoria;

    const categoriascarros = buscarcarroPorCategoria(nomeCategoriaBuscada);

    if (categoriascarros !== "") {
        const templatePath = path.join(__dirname, '/html/dados-carro.html');
        const templateData = fs.readFileSync(templatePath, 'utf-8');
        const html = templateData.replace(
            '<div class="card-body"></div>', 
            `<div class="card-body">${categoriascarros}</div>`
          );
        res.send(html);

    } else {
       posPesquisa(res, "Carros não encontrados")
    }
});

function truncarDescricao(desc, comprimentoMax){
    if(desc.length > comprimentoMax){
        return desc.slice(0, comprimentoMax) + "...";
    }
    return desc;
}   

app.get('/todos-tabela', (req, res) =>{
    let carsTable = ''

    carros.forEach(carro =>{
        const descricaoTruncada = truncarDescricao(carro.desc, 100)

        carsTable += `
        <tr>
            <td><a href="/buscar-carro/${carro.nome}">${carro.nome}</a></td>
            <td>${carro.categoria}</td>
            <td>${descricaoTruncada}</td>
            <td><img src="${carro.urlFoto} alt="${carro.nome}" style="width: 100px;"></td>
        </tr>
        `;
    })

    const htmlContent = fs.readFileSync(path.join(__dirname, '/html/todos-carros-tabela.html'), 'utf-8')
    const finalHtml = htmlContent.replace("{{carsTable}}", carsTable)

    res.send(finalHtml)


}) 

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/index`);
});