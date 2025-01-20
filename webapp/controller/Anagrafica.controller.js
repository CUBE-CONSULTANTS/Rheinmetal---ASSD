sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, JSONModel, models, API, MessageBox) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.Anagrafica", {
      onInit: async function () {
        this.prevCopy = undefined;
        this.setModel(models.createMainModel(), "Main");
        // this.setModel(models.CreateAnagraficaModel(), "anagraficaModel");
        this.getView().setBusy(true);
        let data = await API.getAnagrafica({
          ACTION: "001",

          // USER_AD: "marco.trotta",
        });

        let anagrafica = data.zst_assd_cliente;
        this.setModel(
          new sap.ui.model.json.JSONModel(anagrafica),
          "anagrafica"
        );
        debugger;
        this.getView().setBusy(false);
      },
      onBeforeShow: async function () {},
    });
  }
);
