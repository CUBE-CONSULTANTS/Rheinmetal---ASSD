sap.ui.define(
  ["./BaseController", "sap/m/MessageBox", "../model/models", "../model/API"],
  function (BaseController, MessageBox, models, API) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.QualificaForn", {
      onInit: async function () {
        this.userLifnr = undefined;
        this.setModel(models.CreateTemplateModel(), "TemplateList");
        this.getRouter()
          .getRoute("Qualifica")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        if (
          this.getOwnerComponent().getModel("user").getData().tipoUtente !==
          "Fornitore"
        ) {
          this.showBusy(0);
          try {
            await this._setAnagraficaMc();
            await this._setUploadMaskModel();
            await this.callList();
          } catch (error) {
            MessageBox.error(this.getBundleText("genError"));
          } finally {
            this.hideBusy(0);
          }
        }
      },
    });
  }
);
