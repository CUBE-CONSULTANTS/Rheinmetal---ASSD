sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/models",
    "../model/mapper",
    "../model/formatter",
    "../model/API",
    "../model/Dialog",
    "sap/ui/model/Sorter",
    "sap/m/PDFViewer",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    Controller,
    UIComponent,
    History,
    Fragment,
    JSONModel,
    MessageBox,
    MessageToast,
    models,
    mapper,
    formatter,
    API,
    Dialog,
    Sorter,
    PDFViewer,
    Spreadsheet
  ) {
    "use strict";
    return Controller.extend("rheinmetalassd.controller.BaseController", {
      /**
       * Convenience method for accessing the component of the controller's view.
       * @returns {sap.ui.core.Component} The component of the controller's view
       */
      getOwnerComponent: function () {
        return Controller.prototype.getOwnerComponent.call(this);
      },
      /**
       * Convenience method to get the components' router instance.
       * @returns {sap.m.routing.Router} The router instance
       */
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
      /**
       * Convenience method for getting the i18n resource bundle of the component.
       * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle of the component
       */
      getResourceBundle: function () {
        let oComponent;
        this.getOwnerComponent() === undefined
          ? (oComponent = this._oComponent)
          : (oComponent = this.getOwnerComponent());
        return oComponent.getModel("i18n").getResourceBundle();
      },
      getBundleText: function (i18nID) {
        return this.getResourceBundle().getText(i18nID);
      },
      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @param {string} [sName] The model name
       * @returns {sap.ui.model.Model} The model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },
      /**
       * Convenience method for setting the view model in every controller of the application.
       * @param {sap.ui.model.Model} oModel The model instance
       * @param {string} [sName] The model name
       * @returns {sap.ui.core.mvc.Controller} The current base controller instance
       */
      setModel: function (oModel, sName) {
        this.getView().setModel(oModel, sName);
        return this;
      },
      /**
       * Convenience method for triggering the navigation to a specific target.
       * @public
       * @param {string} sName Target name
       * @param {object} [oParameters] Navigation parameters
       * @param {boolean} [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
       */
      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, undefined, bReplace);
      },
      /**
       * Convenience event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the main route.
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("main", {}, undefined, true);
        }
      },
      onNav: function (oEvent) {
        if (!this.saved) {
          MessageBox.warning(this.getBundleText("saveChanges"), {
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            emphasizedAction: sap.m.MessageBox.Action.YES,
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                this.saved = true;
                this.onNavBack();
              }
            }.bind(this),
          });
        } else {
          this.onNavBack();
        }
      },

      navigateToView: function (oFCL, viewName, lifnr, name, copy, oComponent) {
        let loadView = function () {
          return new Promise(function (resolve, reject) {
            let oView = sap.ui.getCore().byId(viewName);
            if (!oView) {
              sap.ui
                .xmlview({ viewName: viewName })
                .loaded()
                .then(function (oViewInstance) {
                  oView = oViewInstance;
                  oFCL.addMidColumnPage(oView);
                  oView.getController().setOwnerComponent(oComponent);
                  resolve(oView);
                });
            } else {
              resolve(oView);
            }
          });
        };
        loadView().then(function (oView) {
          oFCL.to(oView.getId());
          if (oView.getController().onBeforeShow) {
            oView.getController().onBeforeShow(lifnr, name, copy, oComponent);
          }
        });
      },
      setOwnerComponent: function (oComponent) {
        this._oComponent = oComponent;
      },
      onExpandMidColumn: function () {
        debugger;
        let oFlexibleColumnLayout = this.getView().getParent().getParent();
        oFlexibleColumnLayout.setLayout("MidColumnFullScreen");
        let oLayoutModel = new JSONModel({
          isExpanded: true,
        });
        this.getView().setModel(oLayoutModel, "layout");
      },
      onRestoreLayout: function () {
        let oFlexibleColumnLayout = this.getView().getParent().getParent();
        oFlexibleColumnLayout.setLayout("TwoColumnsBeginExpanded");
        this.getView()
          .getModel("layoutModel")
          .setProperty("/isExpanded", false);
      },

      showBusy: function (delay) {
        // sap.ui.core.BusyIndicator.show(delay || 0);
        sap.ui.core.BusyIndicator.show(delay);
      },
      hideBusy: function (delay) {
        // sap.ui.core.BusyIndicator.hide(delay || 0);
        sap.ui.core.BusyIndicator.hide(delay);
      },
    });
  }
);
