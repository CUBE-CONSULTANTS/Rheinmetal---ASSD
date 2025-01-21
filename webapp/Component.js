/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "./model/models",
    "./model/API",
    "sap/ui/core/IconPool",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "./model/Auth",
  ],
  function (
    UIComponent,
    Device,
    models,
    API,
    IconPool,
    JSONModel,
    MessageBox,
    Auth
  ) {
    "use strict";

    return UIComponent.extend("rheinmetalassd.Component", {
      metadata: {
        manifest: "json",
      },
      init: async function () {
        // call the base component's init function
        UIComponent.prototype.init.call(this); // create the views based on the url/hash
        // create the views based on the url/hash
        this.getRouter().initialize();
        // create the device model
        this.setModel(models.createDeviceModel(), "device");
        this.setModel(models.createLayoutModel(), "layoutModel");
        this.setModel(models.createUserModel(), "user");

        // da commentare in caso di chiamata locale
        let checkAuth = await Auth.checkAuth();
        if (!checkAuth) {
          Auth._redirectLaunchpad();
        }

        // set icon pool
        const b = [];
        const c = {};

        const t = {
          fontFamily: "SAP-icons-TNT",
          fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/"),
        };

        IconPool.registerFont(t);
        b.push(IconPool.fontLoaded("SAP-icons-TNT"));
        c["SAP-icons-TNT"] = t;

        const B = {
          fontFamily: "BusinessSuiteInAppSymbols",
          fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/"),
        };

        IconPool.registerFont(B);
        b.push(IconPool.fontLoaded("BusinessSuiteInAppSymbols"));
        c["BusinessSuiteInAppSymbols"] = B;
      },

      /**
       * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
       * design mode class should be set, which influences the size appearance of some controls.
       * @public
       * @returns {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
       */
      getContentDensityClass: function () {
        if (this.contentDensityClass === undefined) {
          // check whether FLP has already set the content density class; do nothing in this case
          if (
            document.body.classList.contains("sapUiSizeCozy") ||
            document.body.classList.contains("sapUiSizeCompact")
          ) {
            this.contentDensityClass = "";
          } else if (!Device.support.touch) {
            // apply "compact" mode if touch is not supported
            this.contentDensityClass = "sapUiSizeCompact";
          } else {
            // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
            this.contentDensityClass = "sapUiSizeCozy";
          }
        }
        return this.contentDensityClass;
      },
    });
  }
);
