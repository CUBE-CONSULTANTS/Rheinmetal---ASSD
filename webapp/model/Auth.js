sap.ui.define([], function () {
  "use strict";

  return {
    _getToken: function () {
      return JSON.parse(localStorage.getItem("rheinmetall_user_data"))
        .user_token.value;
    },
    _getTokenTimeout: function () {
      return new Date().getTime();
    },
    checkAuth: async function () {
      if (!JSON.parse(localStorage.getItem("rheinmetall_user_data")))
        return false;

      const user_token = this._getToken();

      if (!user_token) return false;

      const expiry = JSON.parse(localStorage.getItem("rheinmetall_user_data"))
        .user_token.expiry;

      if (this._getTokenTimeout() - expiry >= 86400 * 1000) {
        localStorage.removeItem("rheinmetall_user_data");
        return false;
      }

      return true;
    },
    _redirectLaunchpad: function () {
      const currentUrl = encodeURIComponent(window.location.href);
      const launchpadUrl = `${window.location.origin}/launchpad?redirect=${currentUrl}`;
      window.location.href = launchpadUrl;
    },
  };
});
