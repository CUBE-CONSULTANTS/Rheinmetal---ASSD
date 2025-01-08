sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
  ],

  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, JSONModel, models, API) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.RicercaDoc", {
      onInit: async function () {
        this.setModel(models.createMainModel(), "Main");
      },
      onBeforeShow: async function (lifnr, name, copy, oComponent) {
        if (oComponent) {
          this.setOwnerComponent(oComponent);
        }
        if (lifnr === undefined && copy) {
          this.getModel("RicercaFornModel").setProperty("/fornitori", copy);
          this.getModel("Main").setProperty("/visibility", true);
        }
      },
      navToDocumenti: function (oEvent) {
        let copiaForn =
          this.getModel("RicercaFornModel").getProperty("/fornitori");
        let lifnr = oEvent
          .getSource()
          .getBindingContext("RicercaFornModel")
          .getObject().LIFNR;
        let name = oEvent
          .getSource()
          .getBindingContext("RicercaFornModel")
          .getObject().NAME1;
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.Documenti",
          lifnr,
          name,
          copiaForn,
          this._oComponent
        );
      },
    });
  }
);
