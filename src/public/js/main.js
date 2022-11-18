$(function(){
    const socket = io.connect('http://localhost:3001', { 'forceNew' : true });
    // const socket = io();
    var nick = '';

    //Obtenemos los elementos del DOM
    
    const messageForm = $('#messages-form');
    const messageBox = $('#message');
    const chat = $('#chat');
    const chatDivs = $('#chat > div');

    const nickForm = $('#nick-form');
    const nickError = $('#nick-error');
    const nickName = $('#nick-name');

    const userNames = $('#usernames');

    //Eventos

    // messageForm.submit( e =>{
    //     //Evitamos que se recargue la pantalla:
    //     e.preventDefault();
    //     //Enviamos el evento que debe recibir el servidor:
    //     socket.emit('enviar mensaje', messageBox.val());
    //     //Limpiamos el input
    //     messageBox.val('');
    // });

    //New chat

    messageForm.submit( e =>{
        //Evitamos que se recargue la pantalla:
        e.preventDefault();
        //Enviamos el evento que debe recibir el servidor:
        let tzoffset = new Date().getTimezoneOffset() * 60000;
        const messageData = {
            id_channel: "14329535501",
            author: "1432953",
            content: messageBox.val(),
            type: "text",
            author_type: "member",
            author_name: "app athletic",
            create_at: new Date(Date.now() - tzoffset).toISOString().slice(0, -1),
        };
        const urlSendMessage = 'http://localhost:3001/messages';
        try {
            fetch(urlSendMessage, {
                method: 'POST',
                body: JSON.stringify(messageData),
                headers:{
                  'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(response => console.log('Success:', response));

            socket.emit('enviar mensaje', messageBox.val());

        //     const localDate = new Date();
        //     messageData["create_at"] = localDate.toISOString();
        //     setMessageList((list) => [...list, messageData]);
        //     // setReload((current) => !current);
        //     timer.current = setTimeout(async () => {
        //     if (!receiveMessage.current) {
        //         // console.log("reactive_changefeed");
        //         socket.emit("reactive_changefeed", currentChannel);
        //         try {
        //         const response = await getMessagesByChannelId(currentChannel);
        //         setMessageList(response.data.data);
        //         setCurrentMessage("");
        //         scrollToBottom();
        //         } catch (err) {
        //         enqueueSnackbar(mapErrors(err), errorToast);
        //         }
        //     }
        //     receiveMessage.current = false;
        //     }, 3000);
        //     setCurrentMessage("");
        //     scrollToBottom();
        } catch (err) {
            console.log(err);
        }
        //Limpiamos el input
        messageBox.val('');
    });

    socket.on('nuevo mensaje', function(datos){
        const urlGetMessagesByChannel = 'http://localhost:3001/messages/by-channel?id_channel=14329535501';
        let color = '#f5f4f4';
        let colorOther = '#ff453d';
        if(nick == datos.nick){
            color = '#9ff4c5';
        }

        try {
            chat.append(`
                <div class="msg-area mb-2" style="background-color:${color}">
                    <p class="msg"><b>${datos.nick} :</b> ${datos.msg}</p>
                </div>
            `); 

            setTimeout(function(){
                fetch(urlGetMessagesByChannel, {
                    method: 'GET',
                    headers:{
                    'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .catch(error => console.error('Error:', error))
                .then(response => {
                    console.log('Success:', response);
                    const data = response.data;
                    $(".msg-area").remove();
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        if (element.author != 'bot'){
                            chat.append(`
                                <div class="msg-area mb-2" style="background-color:${color}">
                                    <p class="msg"><b>${datos.nick} :</b> ${element.content} (${element.create_at})</p>
                                </div>
                            `); 
                        }else {
                            chat.append(`
                                <div class="msg-area mb-2" style="background-color:${colorOther}">
                                    <p class="msg"><b>${datos.nick} :</b> ${element.content} (${element.create_at})</p>
                                </div>
                            `); 
                        } 
                    }
                    
                });
            }, 3000);
        } catch (err) {
            console.log(err);
        }

    });

    //Obtenemos respuesta del servidor:

    // socket.on('nuevo mensaje', function(datos){
    //     let color = '#f5f4f4';
    //     if(nick == datos.nick){
    //         color = '#9ff4c5';
    //     }
        
    //     chat.append(`
    //     <div class="msg-area mb-2" style="background-color:${color}">
    //         <p class="msg"><b>${datos.nick} :</b> ${datos.msg}</p>
    //     </div>
    //     `);

    // });


    nickForm.submit( e =>{
        e.preventDefault();
        console.log('Enviando...');
        socket.emit('nuevo usuario', nickName.val(), datos =>{
            if(datos){
                nick = nickName.val();
                $('#nick-wrap').hide();
                $('#content-wrap').show();
            }else{
                nickError.html(`
                <div class="alert alert-danger">
                El usuario ya existe
                </div>
                `); 
            }
            nickName.val('');
        });

    });

    //Obtenemos el array de usuarios de sockets.js
    socket.on('usernames', datos =>{
        let html = '';
        let color = '#000';
        let salir = '';
        console.log(nick);
        for(let i = 0; i < datos.length; i++){
            if(nick == datos[i]){
                color = '#027f43';
                salir = `<a class="enlace-salir" href="/"><i class="fas fa-sign-out-alt salir"></i></a>`;
            }else{
                color = '#000';
                salir = '';
            }
            html += `<p style="color:${color}"><i class="fas fa-user"></i> ${datos[i]} ${salir}</p>`;
        }

        userNames.html(html);
    });

});