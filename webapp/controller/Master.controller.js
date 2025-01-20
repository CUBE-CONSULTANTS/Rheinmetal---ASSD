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

      onExitPress: function () {
        this.navToHome();
        this.getRouter().navTo("main");
      },
    });
  }
);
