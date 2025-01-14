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
        this.setModel(models.CreateAnagraficaModel(), "anagraficaModel");
        this.getView().setBusy(true);
        let data = await API.getAnagrafica({
          ACTION: "001",

          USER_AD: "marco.trotta",
        });

        let anagrafica = data.zst_assd_cliente;
        this.setModel(
          new sap.ui.model.json.JSONModel(anagrafica),
          "anagrafica"
        );
        debugger;
        this.getView().setBusy(false);
      },
      onBeforeShow: async function (lifnr, name, copy, oComponent) {
        if (oComponent) {
          this.setOwnerComponent(oComponent);
        }
        this.name = name;
        this.lifnr = lifnr;
        this.prevCopy = copy;
        // try {
        //   let response = await API.getFornitore({ lifnr: lifnr });
        //   response = response.FORNITORE;
        //   if (response.AUDIT === "X") {
        //     response.AUDIT = true;
        //   } else {
        //     response.AUDIT = false;
        //   }
        //   let oModel = this.getModel("anagraficaModel");
        //   oModel.setData(Object.assign(oModel.getData(), response));
        // } catch {
        //   MessageBox.error(this.getBundleText("messErr"));
        // }
      },
      navToRicerca: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.RicercaForn",
          undefined,
          null,
          this.prevCopy,
          this._oComponent
        );
      },
      navToDocumenti: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.Documenti",
          this.lifnr,
          this.name,
          null,
          this._oComponent
        );
      },
      onUpdateEmail: function (oEvent) {
        let commEmail = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getParent()
          .getAggregation("formElements")[2]
          .getAggregation("fields")[0];
        let ammEmail = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getParent()
          .getAggregation("formElements")[3]
          .getAggregation("fields")[0];
        let qualEmail = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getParent()
          .getAggregation("formElements")[4]
          .getAggregation("fields")[0];
        let isEditable = commEmail.getEditable();

        commEmail.setEditable(!isEditable);
        ammEmail.setEditable(!isEditable);
        qualEmail.setEditable(!isEditable);
      },
      onSaveEmail: function (oEvent) {},
    });
  }
);
