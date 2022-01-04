import { SocketContext } from './SocketContext';
import { useContext, useEffect, useRef, useState } from 'react';

export function useChannel(topic, params, onJoin) {
    const { socket } = useContext(SocketContext);
    const [channel, setChannel] = useState(null);

    const onJoinFun = useRef(onJoin);
    onJoinFun.current = onJoin;

    useEffect(() => {
        if (socket === null) {
            return;
        }
        const ch = socket.channel(topic, params);
        ch.join().receive('ok', message => onJoinFun.current(ch, message));
        setChannel(ch);

        return () => {
            ch.leave();
            setChannel(null);
        };
    }, [socket, topic, params]);

    return channel;
}

function pushPromise(push) {
    return new Promise((resolve, reject) => {
        if (!push) {
            return reject("no push");
        }
        push
            .receive('ok', resolve)
            .receive('error', reject);
        // .receive('timeout', reject('timeout'));
    });
}

export function sendMessage(channel, event, payload) {
    return pushPromise(channel.push(event, payload));
}
