const socket = io();

// Creación de elementos del DOM y variables auxiliares
let user; //Este "user" será con el que el cliente se identificará para saber quién escribió el mensaje.
let chatBox = document.getElementById('chatbox'); //Obtenemos la referencia del cuadro donde se escribirá.

//Alerta de identificación
Swal.fire({
    title:"Identifícate",
    input: 'text', //Indicamos que el cliente nececsita escribir un texto para poder avanzar en la alerta.
    text:"Ingresa tu usuario para identificarte en el chat.",
    inputValidator: (value) => {
        return !value && 'Necesitas escribir un nombre de usuario para continuar.'
        //Esta validación ocurre si el usuario decide dar en "continuar" sin haber colocado un nombre de usuario.
    },
    allowOutsideClick: false //Impide que el usuario salga de la alerta al dar "click" fuera de la alerta
}).then(result => {
    user = result.value;
    document.getElementById('username').textContent = user;
    socket.emit('userAuthenticated', {user: user});
    //Una vez que el usuario se identifica, lo asignamos a la variable user.
});

//Event listener para el input del chat
chatBox.addEventListener('keyup', (evt) => {
    if (evt.key === 'Enter') { //El mensaje se enviará cuando el usuario apriete "Enter" en la caja de chat
        if (chatBox.value.trim().length) {//Corroboramos que el mensaje no esté vacío o sólo contenga espacios.
            socket.emit('message', {user: user, message : chatBox.value}); //Emitimos nuestro primer evento.
            chatBox.value = '';
        }
    }
})

//Escuchar el evento 'messageLogs' en el cliente y actualizra la lista de mensajes
socket.on('messageLogs', (data) => {
    let log = document.getElementById('messageLogs');
    let messagesHtml = "";
    data.forEach(message => {
        messagesHtml += `${message.user} dice: ${message.message}<br>`;
    });
    log.innerHTML = messagesHtml;
})

//Escuchar si se conecta un usuario nuevo
socket.on('newUserConnected', newUser => {
    // Mostrar una notificación usando SweetAlert2
    Swal.fire({
        text:"Nuevo usuario conectado",
        toast: true,
        position: 'top-right',
        icon: 'info',
        title: `${newUser.user} se ha unido al chat`,
        showConfirmButton: false,
        timer: 5000
    });
});