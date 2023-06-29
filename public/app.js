const socket = io();

// Variáveis para armazenar o nome de usuário e a lista de usuários
let username = '';
let userList = [];

// Selecionando as páginas de login e chat pelo seu ID
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

// Selecionando os campos de entrada de login e chat pelo seu ID
let loginInput = document.querySelector('#loginNameInput');
let chatInput = document.querySelector('#chatTextInput');

// Configurando a exibição inicial das páginas de login e chat
loginPage.style.display = 'flex';
chatPage.style.display = 'none';

// Evento 'keyup' é disparado quando uma tecla é liberada no campo de entrada de login
loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        // Obtendo o nome digitado no campo de entrada de login
        let name = loginInput.value.trim();
        
        if (name != '') {
            // Atribuindo o nome de usuário
            username = name;
            
            // Atualizando o título da página com o nome de usuário
            document.title = 'Chat (' + username + ')';
            
            // Enviando uma solicitação de entrada ao servidor com o nome de usuário
            socket.emit('join-request', username);
        }
    }
});

// Evento 'keyup' é disparado quando uma tecla é liberada no campo de entrada de chat
chatInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        // Obtendo o texto digitado no campo de entrada de chat
        let txt = chatInput.value.trim();
        
        // Limpando o campo de entrada de chat
        chatInput.value = '';

        if (txt != '') {
            // Adicionando a mensagem à lista de mensagens no chat
            addMessage('msg', username, txt);
            
            // Enviando a mensagem ao servidor
            socket.emit('send-msg', txt);
        }
    }
});

// Função para renderizar a lista de usuários no chat
function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    
    // Iterando sobre a lista de usuários e criando itens de lista para cada um
    userList.forEach(i => {
        ul.innerHTML += '<li>' + i + '</li>';
    });
}

// Função para adicionar mensagens ao chat
function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            // Adicionando uma mensagem de status à lista de mensagens no chat
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += '<li class="m-txt"><span class="me">' + user + '</span> ' + msg + '</li>';
            } else {
                // Adicionando uma mensagem de usuário à lista de mensagens no chat
                ul.innerHTML += '<li class="m-txt"><span>' + user + '</span> ' + msg + '</li>';
                break;
            }

    }

    ul.scrollTop = ul.scrollHeight;
}


// Evento 'user-ok' é disparado quando o servidor confirma a entrada do usuário
socket.on('user-ok', (list) => {
    // Ocultando a página de login e exibindo a página de chat
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatInput.focus();

    // Adicionando uma mensagem de status à lista de mensagens no chat
    addMessage('status', null, 'Conectado!');

    // Atualizando a lista de usuários com base nos dados recebidos do servidor
    userList = list;
    renderUserList();
});

// Evento 'list-update' é disparado quando a lista de usuários é atualizada pelo servidor
socket.on('list-update', (data) => {
    if (data.joined) {
        // Adicionando uma mensagem de status informando que um novo usuário entrou no chat
        addMessage('status', null, `${data.joined} entrou no chat!`);
    }

    if (data.left) {
        // Adicionando uma mensagem de status informando que um usuário saiu do chat
        addMessage('status', null, `${data.left} saiu do chat!`);
    }

    // Atualizando a lista de usuários com base nos dados recebidos do servidor
    userList = data.list;
    renderUserList();
});

// Evento 'show-msg' é disparado quando uma mensagem é recebida do servidor
socket.on('show-msg', (data) => {
    // Adicionando a mensagem à lista de mensagens no chat
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado.');
    userList = [];
    renderUserList();
});

socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentando reconectar');
})

socket.one('reconnect', () => {
    addMessage('status', null, 'Reconectado!');

    if(username != '') {
        socket.emit('join-request', username)
    }
})