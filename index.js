const http = require("http");  //we create http server using http
const { connection } = require("websocket");
const Socket = require("websocket").server //after we create socket object from the socket server
const server = http.createServer(()=>{}) //we create a server instant from http object
//after that we stop the server 

server.listen(3000,()=>{
    console.log("server started on port 3000");
})
// started to run nodemon in cmd

const websocket = new Socket({httpServer:server})

const users = []
websocket.on('request',(req)=>{
    const connection = req.accept();
   //console.log(connection);

    connection.on('message',(message)=>{
        const data = JSON.parse(message.utf8Data)
        console.log(data);
        const user=findUser(data.name);
       // console.log(data);
        switch(data.type){
            case "store_user":
               if(user != null){
                //our user exist
                connection.send(JSON.stringify({
                    type:'user already exists'
                }))
                return 
               }
               const newUser = {
                name:data.name,conn:connection
               }
               users.push(newUser)
            break

            case "start_call":
                let userToCall = findUser(data.target)
                if(userToCall){
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is ready for call"
                    }))
                }
                else{
                  connection.send(JSON.stringify({
                    type:"call_response",data:"user is not online"
                  }))
                }
                break

                case "create_offer":
                    let userToReceiveOffer = findUser(data.target)

                    if(userToReceiveOffer){
                        userToReceiveOffer.conn.send(JSON.stringify({
                            type:"offer_received",
                            name:data.name,
                            data:data.data.sdp
                        }))
                    }
                    break

                    case "create_answer":
                        let userToReceivedAnswer =  findUser(data.target)
                        if(userToReceivedAnswer){
                            userToReceivedAnswer.conn.send(JSON.stringify({
                                type:"answer_received",
                                name:data.name,
                                data:data.data.sdp
                            }))
                        }

                        break

                        case "ice_candidate":
                            let userToReceiveIceCandidate = findUser(data.target)

                            if(userToReceiveIceCandidate){
                                userToReceiveIceCandidate.conn.send(JSON.stringify({
                                    type:"ice_candidate",
                                    name:data.name,
                                    data:{
                                        sdpMLineIndex:data.data.sdpMLineIndex,
                                        sdpMid:data.data.sdpMid,
                                        sdpCandidate: data.data.sdpCandidate
                                    }

                                }))
                            }
        }

    })


connection.on('close',()=>{
    users.forEach(user =>{
        if(user.conn === connection){
            users.splice(users.indexOf(user),1)
        }
    })
})


})

const findUser = username => {
    for(let i=0;i<users.length;i++){
        if(users[i].name === username)
        return users[i]
    }
}

