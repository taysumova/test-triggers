'use strict';


/* eslint-disable max-len */

let applicationServerPublicKey = '';
// Получаем ключ при инициализации
addEventListener('message', event => {
  // event is an ExtendableMessageEvent object
  applicationServerPublicKey = event.data;
}, { once: true });

/* eslint-enable max-len */

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// listening for push events in our service worker
// self is referencing the service worker itself, so we are adding an event listener to our service worker.
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');



  // When a push message is received, our event listener will be fired, and we create a notification by calling showNotification() on our registration.
  // showNotification() expects a title and we can give it an options object. Here we are going to set a body message, icon and a badge in the options
  // (the badge is only used on Android at the time of writing).
  let data = JSON.parse(event.data.text());
  console.log(`[Service Worker] Push had this data: "${data.title, data.options}"`);
  // This method takes a promise and the browser will keep your service worker alive and running until the promise passed in has resolved.
  // show
  event.waitUntil(self.registration.showNotification(data.title, data));
});

// handle notification clicks by listening for notificationclick events
// When the user clicks on the notification, the notificationclick event listener will be called.
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  let data = JSON.parse(event.data.text());
  event.waitUntil(
    clients.openWindow(data.click_action)
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
      .then(function (newSubscription) {
        // TODO: Send to application server
        console.log('[Service Worker] New subscription: ', newSubscription);
      })
  );
});
