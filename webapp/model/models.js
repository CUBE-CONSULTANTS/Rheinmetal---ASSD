sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/model/BindingMode", "sap/ui/Device"],
  function (JSONModel, BindingMode, Device) {
    "use strict";

    return {
      createUserModel: function () {
        return new JSONModel({
          username: "",
        });
      },
      createLayoutModel: function () {
        return new JSONModel({
          layout: "TwoColumnsMidExpanded",
        });
      },
      createDeviceModel: function () {
        let oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode(BindingMode.OneWay);
        return oModel;
      },
      createMainModel: function () {
        return new JSONModel({
          visibility: false,
          editable: false,
          enabled: false,
          busy: false,
          isRdo: false,
          isOda: false,
          selected: false,
        });
      },
    };
  }
);
