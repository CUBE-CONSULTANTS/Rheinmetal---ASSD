sap.ui.define(
  [
    "sap/ui/core/Fragment",
    "../model/API",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    ], 
    function (Fragment,API,MessageBox,Filter,
      FilterOperator){
    "use strict";

    return {

      _getDialogBase: async function ({ name, path, controller, model }) {
        this[name] = await Fragment.load({
          id: controller.getView().getId(),
          name:  path,
          controller,
        });

        this[name].setModel(model);
        controller.getView().addDependent(this[name]);
        return this[name];
      },
      onOpenDialog: function (dialName, fragmName, self, ...oModel) {
        
				let oView = self.getView();
				if (!self[dialName]) {
          Fragment.load({
              id: oView.getId(),
              name: fragmName,
              controller: self
          }).then((oDialog) => {
              oView.addDependent(oDialog);
              oDialog.setModel(self.getModel(...oModel));
              self[dialName] = oDialog;
              oDialog.open();
          });
        } else {
            self[dialName].open();
        }
      },
      handleSearch: function(oEvent,...filtersName){
        let sValue = oEvent.getParameter("value").toUpperCase()
        let aFilters = filtersName.map(fieldName => {
          return new Filter(fieldName, FilterOperator.Contains, sValue)
        })
        let oBinding = oEvent.getParameter("itemsBinding")
        oBinding.filter(new Filter({
          filters: aFilters,
          and: false 
        }))
      },
      onClose: function (dialog) {
          dialog.close()
      }
    };
  }
);