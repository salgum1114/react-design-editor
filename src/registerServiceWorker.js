export default function register() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = './sw.js';
            navigator.serviceWorker.register(swUrl).then((registration) => {
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // At this point, the old content will have been purged and
                                // the fresh content will have been added to the cache.
                                // It's the perfect time to display a "New content is
                                // available; please refresh." message in your web app.
                                console.log('New content is available; please refresh.');
                            } else {
                                // At this point, everything has been precached.
                                // It's the perfect time to display a
                                // "Content is cached for offline use." message.
                                console.log('Content is cached for offline use.');
                            }
                        }
                    };
                };
                // Use serviceWorker.ready to ensure that you can subscribe for push
                navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
                    // registration.pushManager.getSubscription().then((sub) => {
                    //     if (sub === null) {
                    //       // Update UI to ask user to register for Push
                    //         console.log('Not subscribed to push service!');
                    //     } else {
                    //       // We have a subscription, update the database
                    //         console.log('Subscription object: ', sub);
                    //     }
                    // });
                    const options = {
                        userVisibleOnly: true,
                        // applicationServerKey: urlB64ToUint8Array(
                        //     'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
                        // ),
                    };
                    serviceWorkerRegistration.pushManager.subscribe(options).then((pushSubscription) => {
                        // The push subscription details needed by the application
                        // server are now available, and can be sent to it using,
                        // for example, an XMLHttpRequest.
                        console.log('Endpoint URL: ', pushSubscription.endpoint);
                    }).catch((error) => {
                        // During development it often helps to log errors to the
                        // console. In a production environment it might make sense to
                        // also report information about errors back to the
                        // application server.
                        if (Notification.permission === 'denied') {
                            console.warn('Permission for notifications was denied');
                        } else {
                            console.error('Unable to subscribe to push', error);
                        }
                    });
                });
            }).catch((error) => {
                console.error('Error during service worker registration:', error);
            });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.unregister();
        });
    }
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
