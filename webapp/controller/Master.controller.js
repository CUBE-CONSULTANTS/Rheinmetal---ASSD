sap.ui.define(
  ["./BaseController", "sap/m/MessageBox", "../model/models", "../model/API"],
  function (BaseController, MessageBox, models, API) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.Master", {
      onInit: async function () {},
      navToHome: function () {
        this.oFC = this.getView().getParent().getParent();
        this.oFC.toMidColumnPage(this.oFC.getMidColumnPages()[0]);
      },
      navToRicercaDoc: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.RicercaDoc",
          null,
          null,
          null,
          this.getOwnerComponent()
        );
      },
      navToRicerca: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.RicercaForn",
          null,
          null,
          null,
          this.getOwnerComponent()
        );
      },
      navToDocumenti: function (lifnr) {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.Documenti",
          lifnr,
          null,
          null,
          this.getOwnerComponent()
        );
      },
      navToTemplate: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.Template",
          null,
          null,
          null,
          this.getOwnerComponent()
        );
      },
      navToAnagrafica: function (lifnr) {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.Anagrafica",
          lifnr,
          null,
          null,
          this.getOwnerComponent()
        );
      },
      onAnagraficaBtnPress: function () {
        this.getOwnerComponent().getModel("user").getProperty("/tipoUtente") ===
        "Interno"
          ? this.navToRicerca()
          : this.navToAnagrafica(
              this.getOwnerComponent().getModel("user").getData().lifnr
            );
      },
      onDocBtnPress: function () {
        this.getOwnerComponent().getModel("user").getProperty("/tipoUtente") ===
        "Interno"
          ? this.navToRicercaDoc()
          : this.navToDocumenti(
              this.getOwnerComponent().getModel("user").getData().lifnr
            );
      },
      onExitPress: function () {
        this.navToHome();
        this.getRouter().navTo("main");
      },
    });
  }
);
