window.app.notify = (function() {
  "use strict";
  
  var addNotificationToDom,
      displayNotifications,
      notify,
      notifications = {};

  addNotificationToDom = function addNotificationToDom(text, type) {
    var clickToClose  = true,
        timeout       = 4000,
        cssClass      = 'humane-original-info';

    if (type === 'alert' || type === 'error') {
      timeout   = 0;
      cssClass  = 'humane-original-error';
    }

    humane.log(text, { baseCls: 'humane-original', timeout: timeout, clickToClose: clickToClose, addnCls: cssClass });
  };

  displayNotifications = function displayNotifications() {
    if (!$.isReady) {
      return;
    }

    $.each(notifications, function(type, notificationsForType) {
      $.each(notificationsForType, function(idx, text) {
        addNotificationToDom(text, type);
      });

      notifications[type] = [];
    });
  };

  notify = function notify(text, type) {
    if (typeof notifications[type] === 'undefined') {
      notifications[type] = [];
    }

    notifications[type].push(text);
    displayNotifications();
  };

  return notify;
})();