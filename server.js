// Importan as dependências necessárias
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

// Cria uma instância do aplicativo Express
const app = express();

// Cria um servidor HTTP usando o aplicativo Express
const server = http.createServer(app);

// Cria uma instância do Socket.IO passando o servidor HTTP
const io = socketIO(server);

// Configurando o servidor para ouvir na porta 3000
server.listen(3000);

// Configurando o Express para usar arquivos estáticos na pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Array para armazenar os usuários conectados
let connectedUsers = [];

// Evento 'connection' é disparado quando um cliente se conecta ao servidor usando Socket.IO
io.on('connection', (socket) => {
    console.log('Conexão detectada...');

    // Evento 'join-request' é disparado quando um cliente envia uma solicitação de entrada
    socket.on('join-request', (username) => {
        // Atribuindo o nome de usuário ao objeto 'socket' para referência futura
        socket.username = username;
        
        // Adicionando o nome de usuário ao array 'connectedUsers'
        connectedUsers.push(username);
        
        console.log(connectedUsers);

        // Emitindo um evento 'user-ok' para o cliente atual com a lista de usuários conectados
        socket.emit('user-ok', connectedUsers);

        // Emitindo um evento 'list-update' para todos os clientes, exceto o atual,
        // informando que um novo usuário se juntou e enviando a lista atualizada de usuários conectados
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    // Evento 'disconnect' é disparado quando um cliente é desconectado do servidor
    socket.on('disconnect', () => {
        // Removendo o nome de usuário desconectado do array 'connectedUsers'
        connectedUsers = connectedUsers.filter(u => u != socket.username)
        console.log(connectedUsers);

        // Emitindo um evento 'list-update' para todos os clientes, exceto o atual,
        // informando que um usuário saiu e enviando a lista atualizada de usuários conectados
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    // Evento 'send-msg' é disparado quando um cliente envia uma mensagem
    socket.on('send-msg', (txt) => {
        // Criando um objeto contendo o nome de usuário e a mensagem
        let obj = {
            username: socket.username,
            message: txt
        }

        // Emitindo um evento 'show-msg' para todos os clientes, exceto o atual,
        // para exibir a mensagem enviada pelo cliente
        socket.broadcast.emit('show-msg', obj);
    });
});
