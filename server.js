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

    res.send('<h1> carro atualizado com sucesso! </h1> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a><br><a href="http://localhost:3001/atualizar-carro">Atualizar cadastro</a>');

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

    res.send('<h1> carro adicionado com sucesso! </h1> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a><br><a href="http://localhost:3001/atualizar-carro">Atualizar cadastro</a>');
});

function buscarcarroPorNome(nome) {

    return carros.find(carro => carro.nome.toLowerCase() === nome.toLowerCase());
}

app.get('/buscar-carro', (req, res) =>{
    res.sendFile(path.join(__dirname, '/html/buscar-carro.html'));
}) 

app.post('/buscar-carro', (req, res) => {
    const nomeBuscado = req.body.nome

    const carroEncontrado = buscarcarroPorNome(nomeBuscado);

    if (carroEncontrado) {
        res.send(`<h1>carro encontrado:</h1> <pre>${JSON.stringify(carroEncontrado, null, 2)}</pre> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a>`);
    } else {
        res.send('<h1>carro não encontrado.</h1> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a><br><a href="http://localhost:3001/atualizar-carro">Atualizar cadastro</a>');
    }
});



function buscarcarroPorCategoria(categoria) {
    let categoriascarros = ""; 

    carros.forEach(carro => {
        if(carro.categoria.toLowerCase() === categoria.toLowerCase()){
            categoriascarros += `${JSON.stringify(carro, null, 2)}\n`;
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
        res.send(`<h1>carros encontrados:</h1> <pre> ${categoriascarros} </pre> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a><br><a href="http://localhost:3001/atualizar-carro">Atualizar cadastro</a>`);
    } else {
        res.send('<h1>Nenhum carro encontrado.</h1> <br><a href="http://localhost:3001/adicionar-carro">Adicionar carros</a><br><a href="http://localhost:3001/buscar-carro">Buscar por carros</a><br><a href="http://localhost:3001/categoria-carro">Buscar por Categoria</a><br><a href="http://localhost:3001/atualizar-carro">Atualizar cadastro</a>');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/index`);
});