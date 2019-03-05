package com.fanap.gameCenter.TIS.Network;

import com.fanap.gameCenter.TIS.Share.ConfigData;
import com.fanap.gameCenter.TIS.Share.ServiceException;
import com.fanap.gameCenter.TIS.Share.Util;
import org.json.JSONObject;

import java.io.IOException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

abstract class TCPSocketHandler extends SocketInterface {
    private TCPSocketHandler self;
    private String pushServerAddress;

    private int pcct;//push check connection timeout
    private int pcctt;//check connection timeout threshold
    private int WSCWTI;//connection wait time interval
    private int pingTimeCheck;
    private MySocket mySocket;

    TCPSocketHandler(String serverAddress){
        self = this;
        pushServerAddress = serverAddress;
        pcct = ConfigData.PCCT;
        pcctt = ConfigData.PCCTT;
        WSCWTI = ConfigData.WSCWTI;
        pingTimeCheck = pcct - pcctt;

        connect();
    }

    @Override
    public void connect() {
        mySocket = new MySocket(pushServerAddress) {
            @Override
            public void onMessage(JSONObject message) {
                self.onMessage(message);
            }

            @Override
            public void onOpen(MySocket webSocket) {
                self.onOpen(self);
            }

            @Override
            public void onClose(int errorCode) {
                self.onClose(errorCode);
            }
        };
        mySocket.start();
    }

    @Override
    public void logout() {
        mySocket.close();
    }

    @Override
    public void close() {
        mySocket.close();
    }


    @Override
    public void emit(Integer type, JSONObject content) throws ServiceException {

        try {

            if (type == 2 || type==0) {
                mySocket.send(content.toString());
            } else {
                JSONObject data = new JSONObject();
                data.put("type", type);
                data.put("content", content.toString());

                mySocket.send(data.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceException(e);
        }
    }

    public abstract void onMessage(JSONObject message);

    public abstract void onOpen(SocketInterface webSocket);

    public abstract void onClose(int errorCode);

    private interface MessageListener{

        public void onMessage(String message);
        public void onFail();

    }


    private abstract class MySocket extends Thread{
        private Socket socket;
        private MySocket self;
        private String host;
        private int port=8002;
        private boolean readState = true;
        private String lastPingTimeoutId = null;
        private String lastMessageTimeoutId = null;
        private Date lastMessageTime;

        public MySocket(String pushServerAddress) {
            self = this;
            String[] data = pushServerAddress.split(":");
            if (data.length > 1) {
                host = data[0];
                port = Integer.parseInt(data[1]);
            } else {
                host = data[0];
            }
        }

        private void ping() throws ServiceException {
            emit(0, new JSONObject());
            lastPingTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback(){
                @Override
                public void onDone() {
                    Date currentData = new Date();
                    if (currentData.getTime() - lastMessageTime.getTime() > (pcct + pcctt)) {
                        try {
                            socket.close();
                        } catch (IOException e) {
                            onClose(60000);
                            e.printStackTrace();
                        }
                    }
                }

            },pcct);
        }

        public void close(){
            if (lastMessageTimeoutId != null) {
                Util.clearTimeout(lastMessageTimeoutId);
                lastMessageTimeoutId = null;
            }

            if (lastPingTimeoutId != null) {
                Util.clearTimeout(lastPingTimeoutId);
                lastPingTimeoutId = null;
            }

            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }


        @Override
        public void run(){
            try {
                socket = new Socket(host,port);
                onOpen(self);

                initReadSocketThread(socket,new MessageListener() {
                    @Override
                    public void onMessage(String message) {
                        try {

                            self.onMessage(new JSONObject(message));

                            lastMessageTime = new Date();

                            Util.clearTimeout(lastMessageTimeoutId);
                            Util.clearTimeout(lastPingTimeoutId);
                            lastMessageTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                                @Override
                                public void onDone() {
                                    Date currentDate = new Date();
                                    if(currentDate.getTime() - lastMessageTime.getTime() >= pingTimeCheck) {
                                        try {
                                            ping();
                                        } catch (ServiceException e) {
                                            e.printStackTrace();
                                        }
                                    }
                                }
                            }, pcct);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }

                    }

                    @Override
                    public void onFail() {
                        self.onClose(4000);
                    }

                });

            } catch (Exception e) {
                e.printStackTrace();
                onClose(4000);
            }

        }

        private String readSocket(Socket socket) throws Exception{
            byte[] responseDataLengthBuffer = new byte[4];
            int responseLength = 0;
            int currentReadBytes;

            while (responseLength < responseDataLengthBuffer.length)
            {
                currentReadBytes =  socket.getInputStream().read(responseDataLengthBuffer, responseLength, responseDataLengthBuffer.length - responseLength);
                if (currentReadBytes == 0) {
                    readSocket(socket);
                }

                responseLength += currentReadBytes;
            }

            int responseDataLength = ByteBuffer.wrap(responseDataLengthBuffer).getInt();


            byte[] responseObjectBuffer = new byte[responseDataLength];
            int  responseObjectLength = 0;
            int currentResReadBytes;
            while (responseObjectLength < responseObjectBuffer.length)
            {
                currentResReadBytes = socket.getInputStream().read(responseObjectBuffer, responseObjectLength, responseObjectBuffer.length - responseObjectLength);

                if (currentResReadBytes == 0){
                    throw new ServiceException("socketFail");
                }


                responseObjectLength += currentResReadBytes;
            }

            return new String(responseObjectBuffer, "UTF-8");
        }

        private void initReadSocketThread(final Socket socket, final MessageListener messageListener) {
            readState = true;
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    while (readState) {

                        try {

                            String message;
                            message = readSocket(socket);
                            messageListener.onMessage(message);
                        } catch (Exception e) {
                            e.printStackTrace();
                            readState = false;
                            messageListener.onFail();
                        }


                    }


                }
            });

            thread.start();


        }

        public synchronized void send(String message) throws IOException {

            byte[] outStream = message.getBytes(Charset.forName("UTF-8"));
            byte[] outStreamLength = ByteBuffer.allocate(4).putInt(outStream.length).array();
            socket.getOutputStream().write(outStreamLength, 0, outStreamLength.length);
            socket.getOutputStream().write(outStream, 0, outStream.length);
            socket.getOutputStream().flush();

        }

        public abstract void onMessage(JSONObject message);
        public abstract void onOpen(MySocket mySocket);
        public abstract void onClose(int errorCode);

    }
}
