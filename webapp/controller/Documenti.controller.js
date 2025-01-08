sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
    "sap/m/MessageBox",
    "../model/mapper",
    "../model/formatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    models,
    API,
    MessageBox,
    mapper,
    formatter
  ) {
    "use strict";

    return BaseController.extend("rheinmetalassd.controller.Documenti", {
      formatter: formatter,
      onInit: async function () {
        this.setModel(models.createMainModel(), "Main");
      },
      onBeforeShow: async function (lifnr, name, copy, oComponent) {
        if (oComponent) {
          this.setOwnerComponent(oComponent);
        }
        this.fornitore;
        this.setModel(models.CreateDocumentiModel(), "docuModel");
        this.setModel(models.CreateValidationiModel(), "validationModel");
        this.oValidationModel = this.getModel("validationModel").getData();
        this.tipo;
        this.fornitore = lifnr;
        this.getModel("user").getProperty("/tipoUtente") === "Interno"
          ? (this.tipo = "I")
          : (this.tipo = "F");
        if (this.getModel("user").getProperty("/tipoUtente") === "Interno") {
          if (copy) {
            this.prevCopy = copy;
          }
          this.name = name;
        } else {
          if (lifnr) {
            await this._setUploadMaskModel();
          }
        }
        await this._gestioneAllegati(
          this.fornitore,
          this.tipo,
          this.oValidationModel
        );
      },
      _gestioneAllegati: async function (fornitore, tipo, oValidationModel) {
        let oModel = this.getModel("docuModel");
        this.showBusy(0);
        try {
          let allegati = await API.getListaAllegati({
            LIFNR: fornitore,
            TIPO: tipo,
          });
          allegati = allegati.T_LISTA_ALLEGATI;
          if (allegati.length > 0) {
            mapper.setIconColor(allegati);
            let formattedData = mapper.setDocumentList(
              allegati,
              oValidationModel,
              this.tipo
            );
            oModel.setData(
              Object.assign(oModel.getData(), { doc: formattedData })
            );
            oModel.setProperty("/nameForn", formattedData[0].NAME1);
            this.originalData = JSON.parse(JSON.stringify(oModel.getData()));
          } else {
            oModel.setProperty("/enabled", false);
            oModel.setProperty("/nameForn", this.name);
          }
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        }
        this.hideBusy(0);
      },
      navToRicercaDoc: function () {
        this.oFC = this.getView().getParent().getParent();
        this.navigateToView(
          this.oFC,
          "rheinmetalassd.view.RicercaDoc",
          undefined,
          null,
          this.prevCopy,
          this._oComponent
        );
      },
      onDownloadAllegati: async function (oEvent) {
        this._downloadAlleg(oEvent, this.getView().getControllerName());
      },
      confirmValidation: async function () {
        let changedArray = this.getModel("docuModel").getProperty("/doc");
        let promises = [];
        for (let i = 0; i < changedArray.length; i++) {
          let changedValidazione = changedArray[i].validazione.value;
          let originalValidazione = this.originalData.doc[i].validazione.value;
          if (changedValidazione !== originalValidazione) {
            if (changedValidazione == "Validato") {
              changedArray[i].DOKST = "Z2";
            } else if (changedValidazione == "Non validato") {
              changedArray[i].DOKST = "Z3";
            }
            let docObject = {
              DOKAR: changedArray[i].DOKAR,
              DOKNR: changedArray[i].DOKNR,
              DOKVR: changedArray[i].DOKVR,
              DOKTL: changedArray[i].DOKTL,
              DOKST: changedArray[i].DOKST,
            };
            promises.push(docObject);
          }
        }
        if (promises.length > 0) {
          await this.handleApiCalls(promises);
        } else {
          MessageBox.warning(this.getBundleText("noChange"));
        }
      },
      handleApiCalls: async function (modifiedDocs) {
        let that = this;
        let promises = modifiedDocs.map((doc) => {
          return API.setChangeStatus({
            DOKAR: doc.DOKAR,
            DOKNR: doc.DOKNR,
            DOKVR: doc.DOKVR,
            DOKTL: doc.DOKTL,
            DOKST: doc.DOKST,
          });
        });
        try {
          let results = await Promise.allSettled(promises);
          let successLogs = [];
          let errorLogs = [];
          results.forEach((result, index) => {
            if (result.status === "fulfilled") {
              let resp = result.value.TYPE;
              if (resp === "E") {
                let message = result.value.MESSAGE;
                errorLogs.push(message);
              } else {
                successLogs.push(
                  that.getBundleText("Documento") +
                    " " +
                    modifiedDocs[index].DOKNR +
                    " " +
                    that.getBundleText("modified")
                );
              }
            }
          });
          let finalLog =
            [...successLogs, ...errorLogs]
              .map((msg) => msg + ",")
              .join("\n")
              .slice(0, -1) + ".";
          MessageBox.information(finalLog, {
            title: that.getBundleText("log"),
            actions: [sap.m.MessageBox.Action.CLOSE],
            onClose: async function (oAction) {
              if (oAction === sap.m.MessageBox.Action.CLOSE) {
                await that._gestioneAllegati(
                  that.fornitore,
                  that.tipo,
                  that.oValidationModel
                );
              }
            },
          });
        } catch (error) {
          MessageBox.error(this.getBundleText("ErrCall"));
        }
      },
    });
  }
);
