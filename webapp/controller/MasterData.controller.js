sap.ui.define(
  ["./BaseController", "sap/m/MessageBox", "../model/models", "../model/API"],
  function (BaseController, MessageBox, models, API) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.MasterData", {
      onInit: async function () {
        // this.getRouter()
        //   .getRoute("Main")
        //   .attachPatternMatched(this._onObjectMatched, this);
      },
      // _onObjectMatched: async function (oEvent) {},
    });
  }
);
