//Configurar el servidor Express, inicializar el servidor Socket.io y ademas establecer las rutas

import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';

//Importamos los routers
import viewsRouter from './routes/views.router.js';

//Importamos el constructor de un servidor de sockets
import {Server} from 'socket.io';

const app = express();

const httpServer = app.listen(8080, ()=> {
    console.log('Listening on PORT 8080'); //Servidor HTTP
});

//Creamos un servidor de sockets que vive dentro de nuestro servidor HTTP
const io = new Server(httpServer);

//Configuramos todo lo referente a las plantillas
app.engine('handlebars', handlebars.engine());
app.set('views',__dirname + '/views');
app.set('view engine','handlebars');
// Cargamos la carpeta 'public' como nuestra carpeta de archivos estáticos
app.use(express.static(__dirname + '/public'));
//Usamos el enrutador para las vistas
app.use('/',viewsRouter);

let messages = []; //Los mensajes se almacenarán aquí

io.on('connection', socket => {
    console.log("Nuevo cliente conectado");

    //Escuchar del servidor los mensajes emitidos con eventos o etiquetas 'message'
    socket.on('message', (data) => {// Escuchamos el evento con el mismo nombre que el emit del cliente messages
        messages.push(data); //Guardamos el objeto en la "base"
        io.emit('messageLogs', messages); //Reenviamos instántaneamente los logs actualizados
    });

    socket.on('userAuthenticated', user => {
        //Emitir los logs del chat AL USUARIO que se acaba de autenticar
        socket.emit('messageLogs', messages);

        //Emitir una notificación a todos los demás usuarios
        socket.broadcast.emit('newUserConnected', user);
    });

})