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
                // registration.pushManager.getSubscription().then((sub) => {
                //     if (sub === null) {
                //       // Update UI to ask user to register for Push
                //         console.log('Not subscribed to push service!');
                //     } else {
                //       // We have a subscription, update the database
                //         console.log('Subscription object: ', sub);
                //     }
                // });
                console.log(registration);
                registration.pushManager.subscribe({
                    userVisibleOnly: true,
                }).then((sub) => {
                    console.log('Endpoint URL: ', sub.endpoint);
                }).catch((e) => {
                    if (Notification.permission === 'denied') {
                        console.warn('Permission for notifications was denied');
                    } else {
                        console.error('Unable to subscribe to push', e);
                    }
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
