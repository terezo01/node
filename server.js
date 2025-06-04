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
        res.send('<h1>Não foi encontrado nenhum carro com esse nome</h1>')
        return
    }

    carros[carroIndex].categoria = novaCategoria
    carros[carroIndex].desc = novaDesc
    carros[carroIndex].urlFoto = novaUrlFoto

    salvarDados();

    res.send('<h1> carro atualizado com sucesso! </h1> <br><a href="/adicionar-carro">Adicionar carros</a><br><a href="/buscar-carro">Buscar por carros</a><br><a href="/categoria-carro">Buscar por Categoria</a><br><a href="/atualizar-carro">Atualizar cadastro</a>');

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

    res.send('<h1> carro adicionado com sucesso! </h1> <br><a href="/adicionar-carro">Adicionar carros</a><br><a href="/buscar-carro">Buscar por carros</a><br><a href="/categoria-carro">Buscar por Categoria</a><br><a href="/atualizar-carro">Atualizar cadastro</a>');
});


app.get('/deletar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/deletar-carro.html'));
})

app.post('/deletar-carro', (req, res) =>{
    const{nome} = req.body;
   
    const carroIndex = carros.findIndex(carro => carro.nome.toLowerCase() === nome.toLowerCase());
   
    if(carroIndex === -1){
        res.send('<h1>Carro não encontrado.<h1/>');
        return;
    }
    else{
        carros.splice(carroIndex, 1);
        salvarDados();
        res.send(`<h1>O carro ${nome} foi excluido<h1/>`);  
    }
   
});

function buscarcarroPorNome(nome) {

    return carros.find(carro => carro.nome.toLowerCase() === nome.toLowerCase())
}

app.get('/buscar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/buscar-carro.html'));
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
        res.send('<h1>carro não encontrado.</h1> <br><a href="/adicionar-carro">Adicionar carros</a><br><a href="/buscar-carro">Buscar por carros</a><br><a href="/categoria-carro">Buscar por Categoria</a><br><a href="/atualizar-carro">Atualizar cadastro</a>');
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
        res.send('<h1>Nenhum carro encontrado.</h1> <br><a href="/adicionar-carro">Adicionar carros</a><br><a href="/buscar-carro">Buscar por carros</a><br><a href="/categoria-carro">Buscar por Categoria</a><br><a href="/atualizar-carro">Atualizar cadastro</a>');
    }
});

app.get('/todos-tabela', (req, res) =>{
    let carsTable = ''

    carros.forEach(carro =>{
        // const descricaoTruncada = truncarDescricao(carro.desc, 100)

        carsTable += `
        <tr>
            <td>${carro.nome}</td>
            <td>${carro.categoria}</td>
            <td>${carro.desc}</td>
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