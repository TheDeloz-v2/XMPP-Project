"use client";

import { client } from '@xmpp/client';
import React, { useEffect } from 'react';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const XMPPClient = () => {
    useEffect(() => {
        const xmppClient = client({
            service: "ws://alumchat.lol:7070/ws/",
            domain: "alumchat.lol",
            username: 'cas21562',
            password: 'cas21562',
        });

        xmppClient.start().catch(console.error);

        xmppClient.on('session', () => {
            console.log('Connected!');
            // Further implementation here
        });

        return () => {
            xmppClient.stop();
        };
    }, []);

    return (
        <div>
            Your chat UI here
        </div>
    );
};

export default XMPPClient;


