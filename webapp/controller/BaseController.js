sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/models",
    "../model/mapper",
    "../model/formatter",
    "../model/API",
    "../model/Dialog",
    "sap/ui/model/Sorter",
    "sap/m/PDFViewer",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    Controller,
    UIComponent,
    History,
    Fragment,
    JSONModel,
    MessageBox,
    MessageToast,
    models,
    mapper,
    formatter,
    API,
    Dialog,
    Sorter,
    PDFViewer,
    Spreadsheet
  ) {
    "use strict";
    return Controller.extend("rheinmetalassd.controller.BaseController", {
      /**
       * Convenience method for accessing the component of the controller's view.
       * @returns {sap.ui.core.Component} The component of the controller's view
       */
      getOwnerComponent: function () {
        return Controller.prototype.getOwnerComponent.call(this);
      },
      /**
       * Convenience method to get the components' router instance.
       * @returns {sap.m.routing.Router} The router instance
       */
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
      /**
       * Convenience method for getting the i18n resource bundle of the component.
       * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle of the component
       */
      getResourceBundle: function () {
        let oComponent;
        this.getOwnerComponent() === undefined
          ? (oComponent = this._oComponent)
          : (oComponent = this.getOwnerComponent());
        return oComponent.getModel("i18n").getResourceBundle();
      },
      getBundleText: function (i18nID) {
        return this.getResourceBundle().getText(i18nID);
      },
      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @param {string} [sName] The model name
       * @returns {sap.ui.model.Model} The model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },
      /**
       * Convenience method for setting the view model in every controller of the application.
       * @param {sap.ui.model.Model} oModel The model instance
       * @param {string} [sName] The model name
       * @returns {sap.ui.core.mvc.Controller} The current base controller instance
       */
      setModel: function (oModel, sName) {
        this.getView().setModel(oModel, sName);
        return this;
      },
      /**
       * Convenience method for triggering the navigation to a specific target.
       * @public
       * @param {string} sName Target name
       * @param {object} [oParameters] Navigation parameters
       * @param {boolean} [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
       */
      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, undefined, bReplace);
      },
      /**
       * Convenience event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the main route.
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("main", {}, undefined, true);
        }
      },
      onNav: function (oEvent) {
        if (!this.saved) {
          MessageBox.warning(this.getBundleText("saveChanges"), {
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            emphasizedAction: sap.m.MessageBox.Action.YES,
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                this.saved = true;
                this.onNavBack();
              }
            }.bind(this),
          });
        } else {
          this.onNavBack();
        }
      },
      //FAKE NAV -->Carica su stessa pagina oh yeah
      navigateToView: function (oFCL, viewName, lifnr, name, copy, oComponent) {
        let loadView = function () {
          return new Promise(function (resolve, reject) {
            let oView = sap.ui.getCore().byId(viewName);
            if (!oView) {
              sap.ui
                .xmlview({ viewName: viewName })
                .loaded()
                .then(function (oViewInstance) {
                  oView = oViewInstance;
                  oFCL.addMidColumnPage(oView);
                  oView.getController().setOwnerComponent(oComponent);
                  resolve(oView);
                });
            } else {
              resolve(oView);
            }
          });
        };
        loadView().then(function (oView) {
          oFCL.to(oView.getId());
          if (oView.getController().onBeforeShow) {
            oView.getController().onBeforeShow(lifnr, name, copy, oComponent);
          }
        });
      },
      setOwnerComponent: function (oComponent) {
        this._oComponent = oComponent;
      },
      onNavToMain: function (oEvent) {
        let filterbar = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getAggregation("header")
          .getAggregation("content")[0];
        let filterItems = filterbar.getAllFilterItems();
        this.resetFilterItems(filterItems);
        this.hasSearched = false;
        this.getRouter().navTo("main");
        this.getModel("Main").setProperty("/visibility", false);
      },
      resetFilterItems: function (filterItems) {
        filterItems.forEach((oFilterItem) => {
          const oControl = oFilterItem.getControl();
          if (oControl instanceof sap.m.Input) {
            oControl.setValue("");
          } else if (oControl instanceof sap.m.ComboBox) {
            oControl.setSelectedKey("");
          } else if (oControl instanceof sap.m.DateRangeSelection) {
            oControl.setDateValue(null);
            oControl.setSecondDateValue(null);
          }
        });
      },
      _getColumnsConfig: function (oTable) {
        const aCols = [];
        let tipo = "Edm.String";
        let columns = oTable.getColumns();
        if (this.getModel("user").getProperty("/tipoUtente") === "Fornitore") {
          if (!this.getModel("Main").getProperty("/isRdo")) {
            columns = columns.filter((column) => {
              let columnLabel;
              if (column.getLabel() !== null) {
                columnLabel = column.getLabel().getText();
              }
              return !(
                columnLabel === "Fornitore" ||
                columnLabel === "Supplier" ||
                columnLabel === "Description" ||
                columnLabel === "Descrizione"
              );
            });
          } else {
            columns = columns.filter((column) => {
              let columnLabel;
              if (column.getLabel() !== null) {
                columnLabel = column.getLabel().getText();
              }
              return !(
                columnLabel === "Fornitore" ||
                columnLabel === "Supplier" ||
                columnLabel === "Description" ||
                columnLabel === "Descrizione" ||
                columnLabel === "Lead Time" ||
                columnLabel === "Prezzo" ||
                columnLabel === "Price" ||
                columnLabel === "Divisa" ||
                columnLabel === "Currency"
              );
            });
          }
        }
        columns.forEach((el, key) => {
          if (key === 0) {
            return;
          }
          let property = "";
          const oCell = oTable.getRows()[0].getCells()[key];

          if (oCell && oCell.getBindingInfo("text")) {
            const oBindingInfo = oCell.getBindingInfo("text");
            if (oBindingInfo.parts.length > 1) {
              property = oBindingInfo.parts.map((part) => part.path);
            } else {
              property = oBindingInfo.parts[0].path;
            }
          } else if (oCell && oCell.getBindingInfo("value")) {
            const oBindingInfo = oCell.getBindingInfo("value");
            property = oBindingInfo.parts[0].path;
          } else if (
            oCell &&
            oCell.getMetadata().getElementName() === "sap.ui.core.Icon"
          ) {
            property = oCell.getBindingInfo("src").parts[0].path;
            tipo = "Image";
          }
          aCols.push({
            label: el.getLabel().getText(),
            property: property,
            type: tipo,
          });
        });
        return aCols;
      },
      downExcel: function (oEvent) {
        let oTableToDownload = oEvent.getSource().getParent().getParent();
        const oRowBinding = oTableToDownload.getBinding("rows");
        const aCols = this._getColumnsConfig(oTableToDownload);
        const oModel = oRowBinding.getModel();
        const sPath = oRowBinding.getPath();
        const aData = oModel.getProperty(sPath);
        const aFilteredData = aData.filter(
          (item) => item.check && item.check.selected
        );
        let fileName = undefined;
        let aFlatData = [];
        if (aFilteredData.length > 0 && aFilteredData.length === 1) {
          aFlatData = mapper.flatData(aFilteredData);
          this.getModel("Main").getProperty("/isRdo")
            ? (fileName = `${this.getBundleText("rdoN")} ${
                aFlatData[0].richiesta
              }`)
            : (fileName = `${this.getBundleText("odaN")} ${
                aFlatData[0].ordine
              }`);
        } else if (aFilteredData.length === 0) {
          aFlatData = mapper.flatData(aData);
          this.getModel("Main").getProperty("/isRdo")
            ? (fileName = `${this.getBundleText("ListaRdo")}`)
            : (fileName = `${this.getBundleText("ListaOda")} `);
        } else if (aFilteredData.length > 1) {
          MessageBox.error(this.getBundleText("downloadOne"));
          return;
        }

        const oSheet = new Spreadsheet({
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: aFlatData,
          fileName: fileName,
        });
        oSheet.build().finally(function () {
          oSheet.destroy();
          aData.forEach((item) => {
            if (item.check && item.check.selected) {
              item.check.selected = false;
            }
          });
          oModel.setProperty(sPath, aData);
        });
      },
      handleSortDialog: function (oEvent, tableId) {
        let oTable = this.byId(tableId),
          mParams = oEvent.getParameters(),
          oBinding = oTable.getBinding("rows"),
          sPath = mParams.sortItem.getKey(),
          bDescending = mParams.sortDescending,
          aSorters = [];
        if (sPath === "dataVal") {
          oBinding.getContexts().forEach((context) => {
            const obj = context.getObject();
            const dateStr = obj.dataVal;
            obj._dataValAsDate = new Date(
              dateStr.split("/").reverse().join("-")
            );
          });
          aSorters.push(new Sorter("_dataValAsDate", bDescending));
        } else if (sPath === "data") {
          oBinding.getContexts().forEach((context) => {
            const obj = context.getObject();
            const objPosition = obj.posizioni;

            if (objPosition && objPosition.length > 0) {
              const dateStr = objPosition[0].data;
              obj._firstDataAsDate = new Date(
                dateStr.split("/").reverse().join("-")
              );
            } else {
              obj._firstDataAsDate = new Date(0);
            }
          });
          aSorters.push(new Sorter("_firstDataAsDate", bDescending));
        } else {
          aSorters.push(new Sorter(sPath, bDescending));
        }
        oBinding.sort(aSorters);
      },
      clearSortings: function (oEvent, tableId) {
        const oTable = this.byId(tableId);
        oTable.getBinding("rows").sort(null);
      },
      clearFilters: function (oEvent, tableId) {
        let sPath;
        tableId === "TreeTableOda"
          ? (sPath = "ordiniModel>/ordiniAcquisto")
          : (sPath = "richiesteModel>/richiesteOfferta");
        let oTreeTable = this.byId(tableId);
        oTreeTable.bindRows({
          path: sPath,
          parameters: {
            arrayNames: ["posizioni"],
          },
        });
        oTreeTable.getBinding("rows").refresh();
      },
      applyFiltersToTable: function (oEvent, sTableId, oFilterData) {
        let oModel;
        let sPath;
        if (sTableId === "TreeTableOda") {
          oModel = this.getModel("ordiniModel");
          sPath = "ordiniModel>/filteredNodes";
        } else {
          oModel = this.getModel("richiesteModel");
          sPath = "richiesteModel>/filteredNodes";
        }
        let oTreeTable = this.byId(sTableId);
        this.clearFilters(oFilterData, sTableId);
        let aNodes = oTreeTable.getBinding("rows").getNodes();
        let filteredNodes = this.filterNodes(aNodes, oFilterData);
        oModel.setProperty(
          "/filteredNodes",
          filteredNodes.map((node) => node.context.getObject())
        );
        oTreeTable.bindRows({
          path: sPath,
          parameters: {
            arrayNames: ["posizioni"],
          },
        });
        oTreeTable.getBinding("rows").refresh();
        this.onCloseDialog(oEvent);
      },
      filterNodes: function (aNodes, oFilterData) {
        let userType = this.getOwnerComponent()
          .getModel("user")
          .getProperty("/tipoUtente");
        return aNodes.filter((node) => {
          const context = node.context.getObject();
          let matches = true;
          if (
            oFilterData.richiesta &&
            !context.richiesta.includes(oFilterData.richiesta.trim())
          ) {
            matches = false;
          }
          if (
            oFilterData.ordine &&
            !context.ordine.includes(oFilterData.ordine.trim())
          ) {
            matches = false;
          }
          if (
            oFilterData.fornitore &&
            userType === "Interno" &&
            !context.fornitore.includes(oFilterData.fornitore.trim())
          ) {
            matches = false;
          }
          if (
            oFilterData.descrizione &&
            userType === "Interno" &&
            !context.descrizione.includes(oFilterData.descrizione.trim())
          ) {
            matches = false;
          }
          if (oFilterData.materiale) {
            const posizioni = context.posizioni || [];
            const isMaterialMatched = posizioni.some(
              (pos) =>
                pos.Materiale &&
                pos.Materiale.includes(oFilterData.materiale.trim())
            );
            if (!isMaterialMatched) {
              matches = false;
            }
          }
          if (oFilterData.dataVal) {
            if (oFilterData.dataVal.includes(" - ")) {
              const [startDateStr, endDateStr] =
                oFilterData.dataVal.split(" - ");

              const startDate = formatter.parseDate(startDateStr);
              const endDate = formatter.parseDate(endDateStr);
              const dateVal = formatter.parseDate(context.dataVal);
              if (!isNaN(startDate) && !isNaN(endDate) && !isNaN(dateVal)) {
                if (dateVal < startDate || dateVal > endDate) {
                  matches = false;
                }
              }
            } else {
              const singleDate = formatter.parseDate(oFilterData.dataVal);
              const dateVal = formatter.parseDate(context.dataVal);
              if (singleDate.getTime() !== dateVal.getTime()) {
                matches = false;
              }
            }
          }
          if (oFilterData.data) {
            const posizioni = context.posizioni || [];
            if (oFilterData.data.includes(" - ")) {
              const [startDateStr, endDateStr] = oFilterData.data.split(" - ");
              const startDate = formatter.parseDate(startDateStr);
              const endDate = formatter.parseDate(endDateStr);

              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const isDateMatched = posizioni.some((pos) => {
                  const data = formatter.parseDate(pos.data);
                  return (
                    !isNaN(data.getTime()) &&
                    data.getTime() >= startDate.getTime() &&
                    data.getTime() <= endDate.getTime()
                  );
                });

                if (!isDateMatched) {
                  matches = false;
                }
              }
            } else {
              const singleDate = formatter.parseDate(oFilterData.data);
              const isDateMatched = posizioni.some((pos) => {
                const data = formatter.parseDate(pos.data);
                return singleDate.getTime() === data.getTime();
              });
              if (!isDateMatched) {
                matches = false;
              }
            }
          }

          if (oFilterData.stato && oFilterData.stato.key) {
            const statoMapped = mapper.setIconColorString(
              oFilterData.stato.key
            );
            if (context.stato !== statoMapped.icon) {
              matches = false;
            }
          }
          if (oFilterData.lead && userType === "Interno") {
            const posizioni = context.posizioni || [];
            const isLeadtimeMatched = posizioni.some((pos) => {
              const leadtime = pos.lead || "";
              return leadtime.includes(oFilterData.lead.trim());
            });
            if (!isLeadtimeMatched) {
              matches = false;
            }
          }
          if (oFilterData.price && userType === "Interno") {
            const posizioni = context.posizioni || [];
            const isPrezzoMatched = posizioni.some((pos) => {
              const prezzo = parseFloat(pos.price);
              const prezzoFilter = parseFloat(oFilterData.price);
              return !isNaN(prezzo) && prezzo === prezzoFilter;
            });
            if (!isPrezzoMatched) {
              matches = false;
            }
          }
          return matches;
        });
      },
      _setUploadMaskModel: async function () {
        this.setModel(models.createUpDocDialogModel(), "UpDocModel");
        this.showBusy(0);
        try {
          let tipoAllegati = await API.getTipoAllegatiMc();
          tipoAllegati = tipoAllegati.MC_TPALLEGATI;
          let tipoDocItems = tipoAllegati.map((item) => ({
            key: item.DOKAR,
            text: item.DARTXT,
          }));
          let oModel = this.getModel("UpDocModel");
          oModel.setProperty("/tipoDocumento", tipoDocItems);
        } catch (error) {
          throw error;
        } finally {
          this.hideBusy(0);
        }
      },
      onFileChange(oEvent) {
        let oFileUploader = oEvent.getSource();
        let oFile =
          oEvent.getParameter("files") && oEvent.getParameter("files")[0];
        if (oFile) {
          if (
            this.getModel("user").getProperty("/tipoUtente") === "Fornitore"
          ) {
            if (!formatter.checkValidExt(oFile.name.split(".")[1])) {
              MessageBox.error(this.getBundleText("validFormat"));
              oEvent.getSource().setValue("");
              return;
            }
          }
          this.getBase64(oFile)
            .then((base64) => {
              let fileBase64 = base64.split(",")[1];
              let oModel = oFileUploader.getModel("UpDocModel");
              oModel.setProperty("/fileName", oFile.name);
              oModel.setProperty("/fileBase64", fileBase64);
            })
            .catch((error) => {
              MessageToast.show(this.getBundleText("fileError"));
            });
        } else {
          MessageToast.show(this.getBundleText("noFile"));
        }
      },
      onDataChange: function (oEvent) {
        let sPath = oEvent.getSource().getBindingInfo("value").parts[0].path;
        let ini = oEvent
          .getSource()
          .getModel("UpDocModel")
          .getData().dataInizio;
        let dateFormat = sap.ui.core.format.DateFormat.getInstance({
          pattern: "dd/MM/yyyy",
        });
        let fine = oEvent.getSource().getModel("UpDocModel").getData().dataFine;
        let sToday = new Date();
        sToday.setHours(0, 0, 0, 0);
        let dataInizio = dateFormat.parse(ini);
        let dataFine = dateFormat.parse(fine);
        if (dataInizio && dataFine) {
          if (dataInizio > dataFine) {
            this.getModel("UpDocModel").setProperty(sPath, "");
            this.getModel("UpDocModel").refresh();
            MessageBox.error(this.getBundleText("messData"));
          }
        }
      },
      onUploadDoc: async function (oEvent) {
        let compiledData;
        let tipoDoc = this.getModel("UpDocModel").getProperty(
          "/tipoDocumento/value"
        );
        let dataIni = formatter.returnDate(
          this.getModel("UpDocModel").getProperty("/dataInizio"),
          "dd/MM/yyyy",
          "yyyyMMdd"
        );
        let dataFine = formatter.returnDate(
          this.getModel("UpDocModel").getProperty("/dataFine"),
          "dd/MM/yyyy",
          "yyyyMMdd"
        );
        let ext;
        let b64File;

        if (this.getModel("UpDocModel").getProperty("/file")) {
          ext = this.getModel("UpDocModel").getProperty("/file").split(".")[1];
          b64File = this.getModel("UpDocModel").getProperty("/fileBase64");
        }
        if (!dataIni || !dataFine || !b64File || !ext) {
          compiledData = false;
          MessageBox.error(this.getBundleText("reqData"));
        } else {
          if (this.getModel("user").getProperty("/tipoUtente") === "Interno") {
            if (tipoDoc) {
              this.uploadByRhi(
                oEvent,
                tipoDoc,
                b64File,
                dataFine,
                dataIni,
                ext
              );
            } else {
              MessageBox.error(this.getBundleText("reqData"));
            }
          } else {
            this.uploadByForn(
              oEvent,
              b64File,
              dataFine,
              dataIni,
              ext,
              this.objectToUpload.DOKAR,
              this.objectToUpload.DOKNR,
              this.objectToUpload.DOKVR,
              this.objectToUpload.DOKTL,
              this.objectToUpload.DOKST,
              this.objectToUpload.OBJKY
            );
          }
        }
      },

      uploadByRhi: async function (
        oEvent,
        tipoDoc,
        b64File,
        dataFine,
        dataIni,
        ext
      ) {
        this.showBusy(0);
        let that = this;
        if (this.checkDuplicateTemplate(tipoDoc, dataIni, dataFine)) {
          this.hideBusy(0);
          this.onCloseDialog(oEvent);
          return;
        }
        try {
          let dateFormat = sap.ui.core.format.DateFormat.getInstance({
            pattern: "yyyyMMdd",
          });
          let today = new Date();
          let formattedToday = dateFormat.format(today);
          let respUpload = await API.uploadTemplate({
            DOKAR: tipoDoc,
            DATA_INI: dataIni,
            DATA_FINE: dataFine,
            FILE64: b64File,
            EXT: ext,
            DATA_CREA: formattedToday,
          });
          this.onCloseDialog(oEvent);
          if (respUpload.TYPE === "E") {
            MessageBox.error(respUpload.MESSAGE);
          } else {
            MessageBox.success(respUpload.MESSAGE, {
              actions: [sap.m.MessageBox.Action.CLOSE],
              onClose: async function (oAction) {
                if (oAction === sap.m.MessageBox.Action.CLOSE) {
                  await that.callList();
                }
              },
            });
          }
        } catch {
          MessageBox.error(this.getBundleText("errUpload"));
        } finally {
          this.refreshUploadModel(this);
          this.hideBusy(0);
        }
      },
      checkDuplicateTemplate: function (tipoDoc, dataIni, dataFine) {
        let templateList =
          this.getModel("TemplateList").getProperty("/template");

        let isDuplicate = templateList.some((template) => {
          let templateDataIni = template.DATA_INI.replace(/-/g, "");
          let templateDataFine = template.DATA_FINE.replace(/-/g, "");
          return (
            template.DOKAR === tipoDoc &&
            ((dataIni >= templateDataIni && dataIni <= templateDataFine) ||
              (dataFine >= templateDataIni && dataFine <= templateDataFine) ||
              (dataIni <= templateDataIni && dataFine >= templateDataFine))
          );
        });
        if (isDuplicate) {
          MessageBox.error(this.getBundleText("templateUploaded"));
          this.hideBusy(0);
          this.refreshUploadModel(this);
          return true;
        }
        return false;
      },
      callList: async function () {
        this.showBusy(0);
        let oModel = this.getModel("TemplateList");
        try {
          let templateList = await API.getTemplateList();
          templateList = templateList.T_LISTA_TEMPLATE;
          oModel.setData(
            Object.assign(oModel.getData(), { template: templateList })
          );
          oModel.refresh();
        } catch (error) {
          throw error;
        } finally {
          this.hideBusy(0);
        }
      },
      uploadByForn: async function (
        oEvent,
        b64File,
        dataFine,
        dataIni,
        ext,
        dokar,
        doknr,
        dokvr,
        doktl,
        dokst,
        objky
      ) {
        dokst = "Z1";
        this.showBusy(0);
        let that = this;
        try {
          let uploadResp = await API.uploadDms({
            DOKAR: dokar,
            DOKNR: doknr,
            DOKVR: dokvr,
            DOKTL: doktl,
            DOKST: dokst,
            OBJKY: objky,
            DATA_INI: dataIni,
            DATA_FINE: dataFine,
            FILE64: b64File,
            EXT: ext,
          });
          if (uploadResp.TYPE === "E") {
            this.onCloseDialog(oEvent);
            MessageBox.error(uploadResp.MESSAGE, {
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
          } else {
            this.onCloseDialog(oEvent);
            MessageBox.success(uploadResp.MESSAGE, {
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
          }
        } catch {
          MessageBox.error(this.getBundleText("errUpload"));
        } finally {
          this.refreshUploadModel(this);
          this.hideBusy(0);
        }
      },
      refreshUploadModel: function (that) {
        that.getModel("UpDocModel").setProperty("/tipoDocumento/value", "");
        that.getModel("UpDocModel").setProperty("/dataInizio", "");
        that.getModel("UpDocModel").setProperty("/dataFine", "");
        that.getModel("UpDocModel").setProperty("/file", "");
        that.getModel("UpDocModel").refresh();
      },
      _setAnagraficaMc: async function () {
        this.setModel(models.createRicercaFornitoreModel(), "RicercaFornModel");
        await API.getFornitoreMc()
          .then((mc) => {
            this.getModel("RicercaFornModel").setProperty(
              "/filterbar/Fornitore",
              mc.MC_FORNITORE
            );
            this.getModel("RicercaFornModel").setProperty(
              "/filterbar/Descrizione",
              mc.MC_DESCR
            );
            let paesiUnici = mc.MC_PAESE.filter(
              (paese, index, self) =>
                index === self.findIndex((p) => p.COUNTRY === paese.COUNTRY)
            );
            paesiUnici.sort((a, b) => {
              if (a.COUNTRY < b.COUNTRY) return -1;
              if (a.COUNTRY > b.COUNTRY) return 1;
              return 0;
            });
            this.getModel("RicercaFornModel").setProperty(
              "/filterbar/Paese",
              paesiUnici
            );
            this.getModel("RicercaFornModel").setProperty(
              "/filterbar/Piva",
              mc.MC_PIVA
            );
          })
          .catch((error) => {
            throw error;
          });
      },
      _setCommonMc: async function () {
        let tipo;
        this.getModel("Main").getProperty("/isRdo") === false
          ? (tipo = "O")
          : (tipo = "R");
        this.setModel(models.createCommonMcModel(), "CommonMcModel");
        try {
          const [fornitore, stato] = await Promise.all([
            API.getFornitoreMc(),
            API.getStatoRdo({ TIPO: tipo }),
          ]);
          const commonModel = this.getModel("CommonMcModel");
          const fornitoriCombinati = fornitore.MC_FORNITORE.map(
            (item, index) => {
              return {
                LIFNR: item.LIFNR,
                NAME1: fornitore.MC_DESCR[index].NAME1,
              };
            }
          );
          commonModel.setProperty(
            "/filterbar/Fornitore/items",
            fornitoriCombinati
          );

          const statiMappati = stato.MC_STATO.map((item) => {
            return {
              key: item.STATO,
              text: item.DESCR,
            };
          });
          commonModel.setProperty("/filterbar/Stato/items", statiMappati);
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        }
      },
      onMatnrChange: async function (oEvent) {
        let sMatnr = oEvent.getSource().getValue().trim();
        if (sMatnr) {
          this.showBusy(0);
          try {
            let existingMatnr = await API.getMaterialeMc({ MATNR: sMatnr });
            if (existingMatnr.TYPE === "E") {
              MessageBox.error(existingMatnr.MESSAGE);
              oEvent.getSource().setValue("");
            } else {
              this.getModel("CommonMcModel").setProperty(
                "/filterbar/Materiale",
                sMatnr
              );
            }
          } catch {
            this.getBundleText("genError");
          } finally {
            this.hideBusy(0);
          }
        }
      },
      onRdoChange: function (oEvent) {
        let rdoEbeln = oEvent.getSource().getValue();
        let type = "R";
        this.onEbelnChange(oEvent, rdoEbeln, type);
      },
      onOdaChange: function (oEvent) {
        let odaEbeln = oEvent.getSource().getValue();
        let type = "O";
        this.onEbelnChange(oEvent, odaEbeln, type);
      },
      onEbelnChange: async function (oEvent, ebeln, tipo) {
        this.showBusy(0);
        try {
          let searchKey = await API.getRdoOdaKey({ EBELN: ebeln, TIPO: tipo });
          if (searchKey.TYPE === "E") {
            MessageBox.error(searchKey.MESSAGE);
            oEvent.getSource().setValue("");
          }
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      handleSearchForn: function (oEvent) {
        Dialog.handleSearch(oEvent, "LIFNR", "NAME1");
      },
      handleSearchMatnr: function (oEvent) {
        Dialog.handleSearch(oEvent, "MATNR");
      },
      handleSearchDescr: function (oEvent) {
        Dialog.handleSearch(oEvent, "NAME1");
      },
      handleSearchPiva: function (oEvent) {
        Dialog.handleSearch(oEvent, "STCEG");
      },
      handleSearchPaese: function (oEvent) {
        Dialog.handleSearch(oEvent, "COUNTRY");
      },
      handleValueHelp: async function (oEvent) {
        let filterName = oEvent.getSource().getParent().getName();
        this.setModel(new JSONModel(), "dialogModel");
        let oDialog;
        let objFiltro = { items: [] };
        this.getModel("dialogModel").setProperty("/filters", objFiltro);

        switch (filterName) {
          case "CodForn":
            oDialog = await Dialog._getDialogBase({
              name: "codFornDialog",
              path: "rheinmetalassd.view.fragment.QualificaForn.Dialog.FornitoreDialog",
              controller: this,
              model:
                (this.getModel("RicercaFornModel"),
                this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          case "Fornitore":
            oDialog = await Dialog._getDialogBase({
              name: "codFornDialog",
              path: "rheinmetalassd.view.fragment.comDialog.FornitoreDialog",
              controller: this,
              model:
                (this.getModel("CommonMcModel"), this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          case "descr":
            oDialog = await Dialog._getDialogBase({
              name: "descrDialog",
              path: "rheinmetalassd.view.fragment.QualificaForn.Dialog.DescrizioneDialog",
              controller: this,
              model:
                (this.getModel("RicercaFornModel"),
                this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          case "Paese":
            oDialog = await Dialog._getDialogBase({
              name: "PaeseDialog",
              path: "rheinmetalassd.view.fragment.QualificaForn.Dialog.PaeseDialog",
              controller: this,
              model:
                (this.getModel("RicercaFornModel"),
                this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          case "P.IVA":
            oDialog = await Dialog._getDialogBase({
              name: "pivaDialog",
              path: "rheinmetalassd.view.fragment.QualificaForn.Dialog.PIVADialog",
              controller: this,
              model:
                (this.getModel("RicercaFornModel"),
                this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          case "Materiale":
            oDialog = await Dialog._getDialogBase({
              name: "pivaDialog",
              path: "rheinmetalassd.view.fragment.comDialog.MaterialeDialog",
              controller: this,
              model:
                (this.getModel("CommonMcModel"), this.getModel("dialogModel")),
            });
            oDialog.open();
            break;
          default:
            break;
        }
      },
      onConfirmFilter: function (oEvent) {
        let sKey;
        let title = oEvent.getSource().getTitle();
        if (title === this.getBundleText("selezionaCodiceFornitore")) {
          sKey = "LIFNR";
        } else if (title === this.getBundleText("selezionaDescr")) {
          sKey = "NAME1";
        } else if (title === this.getBundleText("selezionaPaese")) {
          sKey = "COUNTRY";
        } else if (title === this.getBundleText("selezionaPiva")) {
          sKey = "STCEG";
        } else if (title === this.getBundleText("selezionaCodiceMatnr")) {
          sKey = "MATNR";
        }
        this.setFilterValue(oEvent, sKey);
      },
      setFilterValue: function (oEvent, sKey) {
        let filterbar, sModelName;
        if (this.byId("filterbarQual") === undefined) {
          filterbar = this.byId("commonFilterBar");
          sModelName = "CommonMcModel";
        } else {
          filterbar = this.byId("filterbarQual");
          sModelName = "RicercaFornModel";
        }
        let filterItems = filterbar.getAllFilterItems();
        let aSelectedItems = oEvent.getParameter("selectedItems");
        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach((oSelectedItem) => {
            let sValue = oSelectedItem
              .getBindingContext(sModelName)
              .getProperty(sKey);
            let oInput = filterItems.find((item) => {
              let oControl = item.getControl();
              return (
                oControl.getBindingInfo("value").parts[0].path.substring(1) ===
                sKey
              );
            });
            if (oInput) {
              oInput.getControl().setValue(sValue);
            }
          });
        }
      },
      onResetFilterBar: function (oEvent) {
        let aInputFilters = oEvent.getParameter("selectionSet");
        aInputFilters.forEach((input) => {
          input.setValue("");
        });
        let comboBox = aInputFilters.find((input) =>
          input.isA("sap.m.ComboBox")
        );
        comboBox.setSelectedKey("");
        this.getModel("Main").setProperty("/visibility", false);
      },
      onSearchData: function (oEvent) {
        let aInputFilters = oEvent.getParameter("selectionSet");
        this.onFilterAvv(aInputFilters, this);
        this.hasSearched = true;
      },
      onFilterAvv: async function (aFilters, oController) {
        this.showBusy(0);
        let filterObj = this.createFilterObject(aFilters);
        try {
          if (
            oController.getView().getControllerName() ===
              "rheinmetalassd.controller.RicercaForn" ||
            oController.getView().getControllerName() ===
              "rheinmetalassd.controller.RicercaDoc"
          ) {
            let fornitori = await API.getListaFornitori({
              LIFNR: filterObj.LIFNR || null,
              NAME1: filterObj.NAME1 || null,
              COUNTRY: filterObj.COUNTRY || null,
              STCEG: filterObj.STCEG || null,
            });
            mapper.setIconColor(fornitori.T_LISTA_FORN);
            this.getModel("RicercaFornModel").setProperty(
              "/fornitori",
              fornitori.T_LISTA_FORN
            );
          } else {
            this.getModel("Main").setProperty("/visibility", false);
            let sFilterLifnr;
            this.getModel("user").getProperty("/tipoUtente") === "Fornitore"
              ? (sFilterLifnr = this.getModel("user").getProperty("/lifnr"))
              : (sFilterLifnr = filterObj.LIFNR);

            if (
              oController.getView().getControllerName() ===
              "rheinmetalassd.controller.ListaRdo"
            ) {
              this.getModel("richiesteModel").setProperty(
                "/richiesteOfferta",
                []
              );

              let oListaRdo = await API.getListaRdo({
                EINDT_DA: filterObj.startDate || null,
                EINDT_A: filterObj.endDate || null,
                MATNR: filterObj.MATNR || null,
                LIFNR: sFilterLifnr || null,
                STATO: filterObj.STATO || null,
                EBELN: filterObj.EBELN || null,
              });
              let aRichieste = mapper.mapRdoList(oListaRdo);
              this.getModel("richiesteModel").setProperty(
                "/richiesteOfferta",
                aRichieste
              );
              this.refreshSelExp(this.byId("TreeTableBasic"));
            } else if (
              oController.getView().getControllerName() ===
              "rheinmetalassd.controller.ListaOda"
            ) {
              this.getModel("ordiniModel").setProperty("/ordiniAcquisto", []);
              let oListaOda = await API.getListaOda({
                EINDT_DA: filterObj.startDate || null,
                EINDT_A: filterObj.endDate || null,
                MATNR: filterObj.MATNR || null,
                LIFNR: sFilterLifnr || null,
                STATO: filterObj.STATO || null,
                EBELN: filterObj.EBELN || null,
              });
              let aOrdini = mapper.mapOdaList(oListaOda);
              this.getModel("ordiniModel").setProperty(
                "/ordiniAcquisto",
                aOrdini
              );
              this.refreshSelExp(this.byId("TreeTableOda"));
            }
          }
          this.getModel("Main").setProperty("/visibility", true);
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      refreshSelExp: function (table) {
        let iRowCount = table.getBinding("rows").getLength();
        table.clearSelection();
        for (let i = 0; i < iRowCount; i++) {
          if (table.isExpanded(i)) {
            table.collapse(i);
          }
        }
      },
      onCloseDialog: function (oEvent) {
        let oParent;
        oEvent.getSource().getParent() instanceof sap.m.Dialog
          ? (oParent = oEvent.getSource().getParent())
          : (oParent = oEvent.getSource().getParent().getParent());
        Dialog.onClose(oParent);
      },
      createFilterObject: function (aFilters) {
        let filterObj = {};
        aFilters.forEach(function (oControl) {
          let oBindingInfo;
          oControl.getBindingInfo("value") === undefined
            ? (oBindingInfo = oControl.getBindingInfo("selectedKey"))
            : (oBindingInfo = oControl.getBindingInfo("value"));
          if (oBindingInfo) {
            let sFilterKey, sFilterValue;
            if (oControl.isA("sap.m.DateRangeSelection")) {
              let startDate = oControl.getDateValue();
              let endDate = oControl.getSecondDateValue();
              if (startDate) {
                filterObj["startDate"] = startDate
                  .toLocaleDateString("en-CA")
                  .replace(/-/g, "");
              }
              if (endDate) {
                filterObj["endDate"] = endDate
                  .toISOString()
                  .slice(0, 10)
                  .replace(/-/g, "");
              }
            } else if (oControl.isA("sap.m.ComboBox")) {
              sFilterKey = oBindingInfo.parts[0].path.split("/").pop();
              sFilterValue = oControl.getSelectedKey();
              if (sFilterValue) {
                filterObj[sFilterKey] = sFilterValue;
              }
            } else {
              sFilterKey = oBindingInfo.parts[0].path.split("/").pop();
              sFilterValue = oControl.getValue();
              if (sFilterValue) {
                filterObj[sFilterKey] = sFilterValue;
              }
            }
          }
        });
        return filterObj;
      },
      getTestiTestataRdo: async function (
        { EBELN, EBELP, TIPO },
        that,
        oModel
      ) {
        that.showBusy(0);
        try {
          let listaTesti = await API.getTesti({ EBELN, EBELP, TIPO });
          listaTesti = listaTesti.TESTI;
          oModel.setProperty("/testata/testi", listaTesti);
          this._buildDynamicView(listaTesti);
        } catch (error) {
          throw error;
        } finally {
          that.hideBusy(0);
        }
      },
      _buildDynamicView: function (aTesti) {
        let oView = this.getView();
        let oFirstVBox = oView.byId("firstVBox");
        let oSecondVBox = oView.byId("secondVBox");
        let oThirdVBox = oView.byId("thirdVBox");
        oFirstVBox.removeAllItems();
        oSecondVBox.removeAllItems();
        oThirdVBox.removeAllItems();
        aTesti.forEach((oTesto, index) => {
          let oHBox = new sap.m.HBox({
            alignItems: "Center",
            justifyContent: "SpaceBetween",
            items: [
              new sap.m.Text({
                text: oTesto.TDTEXT + ":",
              }),
              new sap.m.Button({
                icon: "sap-icon://detail-view",
                type: "Emphasized",
                press: (oEvent) => this.onOpenTesti(oEvent, this, oTesto),
              }),
            ],
          });
          if (index < 3) {
            oFirstVBox.addItem(oHBox);
          } else if (index < 6) {
            oSecondVBox.addItem(oHBox);
          } else {
            oThirdVBox.addItem(oHBox);
          }
        });
      },
      setDetailRdo: async function (rdo, that, oModel) {
        that.showBusy(0);
        try {
          let oDetailRdo = await API.getDetailRdo({ EBELN: rdo });
          oDetailRdo = oDetailRdo.T_DETAIL_RDO;

          const hasPosScaduta = oDetailRdo.some(
            (element) => element.POS_SCADUTA === "Y"
          );
          oDetailRdo.map((element) => {
            element.AENST === 16 ? (element.MOD = "X") : (element.MOD = "");
            element.EINDT = formatter.formatDate(element.EINDT);
            const stato = mapper.setIconColorString(element.STATO);
            element.stato = stato.icon;
            element.colore = stato.colore;
          });
          oModel.setProperty("/posizioni", oDetailRdo);
          that.aDetailCopy = JSON.parse(JSON.stringify(oDetailRdo));
          if (hasPosScaduta) {
            if (
              that.getModel("user").getProperty("/tipoUtente") !== "Interno"
            ) {
              MessageBox.warning(that.getBundleText("scaduta"));
            } else {
              MessageBox.warning(that.getBundleText("scadutaI"));
            }
            this.getModel("detailRdoModel").setProperty("/enabled", false);
          } else {
            this.getModel("detailRdoModel").setProperty("/enabled", true);
          }
        } catch (error) {
          throw error;
        } finally {
          that.hideBusy(0);
        }
      },
      setDetailOda: async function (oda, that, oModel) {
        that.showBusy(0);
        try {
          let oDetailOda = await API.getDetailOda({ EBELN: oda });
          oDetailOda = oDetailOda.T_DETAIL_ODA;
          oDetailOda.map((element) => {
            element.EINDT = formatter.formatDate(element.EINDT);
            element.CONSEGNAZ1 = formatter.formatDate(element.CONSEGNAZ1);
            if (element.NOTA === "Y") {
              element.visible = true;
            } else {
              element.visible = false;
              element.NOTAVAL = "";
            }
            const stato = mapper.setIconColorString(element.STATO);
            element.stato = stato.icon;
            element.colore = stato.colore;
            element.hasProp = false;
          });
          oModel.setProperty("/posizioni", oDetailOda);
          that.aDetailOdaCopy = JSON.parse(JSON.stringify(oDetailOda));
        } catch (error) {
          throw error;
        } finally {
          that.hideBusy(0);
        }
      },
      _downloadAlleg: async function (oEvent, oController) {
        let docToDownload;
        oEvent.getSource().getBindingContext("docuModel") === undefined
          ? (docToDownload = oEvent
              .getSource()
              .getBindingContext("TemplateList")
              .getObject())
          : (docToDownload = oEvent
              .getSource()
              .getBindingContext("docuModel")
              .getObject());
        let downloadResp;
        try {
          if (
            this.getModel("user").getProperty("/tipoUtente") === "Interno" &&
            oController === "rheinmetalassd.controller.Documenti"
          ) {
            downloadResp = await API.getFileDms({
              DOKAR: docToDownload.DOKAR,
              DOKNR: docToDownload.DOKNR,
              DOKVR: docToDownload.DOKVR,
              DOKTL: docToDownload.DOKTL,
            });

            const { FILE64, EXT, DARTXT } = downloadResp;
            if (!FILE64) {
              MessageBox.error(this.getBundleText("downloadTemplateError"));
            } else {
              this.createDownloadLink({ FILE64, EXT, DARTXT });
            }
          } else {
            let prog = await mapper.assDocTypeToTemplate(docToDownload.DOKAR);
            downloadResp = await API.getTemplateFile({
              DOKAR: docToDownload.DOKAR,
              PROGR: prog,
            });
            const { E_TEMP, EXT, DARTXT } = downloadResp;
            if (!E_TEMP) {
              MessageBox.error(this.getBundleText("downloadTemplateError"));
            } else {
              const downloadObj = {
                FILE64: E_TEMP,
                EXT,
                DARTXT,
              };
              this.createDownloadLink(downloadObj);
            }
          }
        } catch (error) {
          MessageBox.error(this.getBundleText("downloadError"));
        } finally {
          this.hideBusy(0);
        }
      },
      createDownloadLink: function ({ FILE64, EXT, DARTXT }) {
        this.showBusy(0);
        return new Promise(async (resolve, reject) => {
          try {
            const downloadLink = document.createElement("a");
            const { dataType, error } =
              mapper.convertFileExtensionToBase64DataType({
                fileExtension: "DOCX",
              });
            if (error)
              return reject({
                fullfilled: false,
                error: MessageBox.errror(
                  this.getBundleText("fileExtensionNotSupported", EXT)
                ),
              });
            downloadLink.href = `data:${dataType};base64,${FILE64}`;
            downloadLink.download = `${DARTXT}.${EXT}`;
            downloadLink.click();
            return resolve({ fullfilled: true, error: "" });
          } catch (error) {
            return reject({
              fullfilled: false,
              error: MessageBox.error(
                this.getBundleText("downloadError", DARTXT)
              ),
            });
          } finally {
            this.hideBusy(0);
          }
        });
      },
      getBase64: function (file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      },
      onOpenMaskAllega: function (oEvent) {
        debugger;
        let title = this.getBundleText("UploadDoc");
        if (oEvent.getSource().getBindingContext("docuModel") !== undefined) {
          this.objectToUpload = oEvent
            .getSource()
            .getBindingContext("docuModel")
            .getObject();
          title +=
            " " +
            oEvent.getSource().getBindingContext("docuModel").getObject()
              .DARTXT;
          this.getModel("UpDocModel").setProperty("/title", title);
        } else {
          let sSelectedValue = this.getModel("UpDocModel").getProperty(
            "/tipoDocumento/value"
          );
          let aTipoDocumento =
            this.getModel("UpDocModel").getProperty("/tipoDocumento");
          let oSelectedItem = aTipoDocumento.find(function (item) {
            return item.key === sSelectedValue;
          });
          let sSelectedText = oSelectedItem.text;
          title += " " + sSelectedText;
          this.getModel("UpDocModel").setProperty("/title", title);
        }
        let mask = new JSONModel();
        this.setModel(mask, "modelloMask");
        Dialog.onOpenDialog(
          "nDialog",
          "rheinmetalassd.view.fragment.QualificaForn.Dialog.maskAllegati",
          this,
          "modelloMask"
        );
      },
      onOpenMaskAllegati: function (oEvent) {
        let that = this;
        if (
          oEvent.getSource().getBindingContext("detailRdoModel") !== undefined
        ) {
          let oModified = oEvent
            .getSource()
            .getBindingContext("detailRdoModel")
            .getObject().MODIFIED;
          if (oModified === "X") {
            MessageBox.warning(this.getBundleText("sureToUp"), {
              actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CLOSE,
              ],
              emphasizedAction: MessageBox.Action.OK,
              onClose: async function (oAction) {
                if (oAction === sap.m.MessageBox.Action.OK) {
                  that.handleOpenMaskAllegati(oEvent);
                }
              },
            });
          } else {
            this.handleOpenMaskAllegati(oEvent);
          }
        } else {
          this.handleOpenMaskAllegati(oEvent);
        }
      },
      handleOpenMaskAllegati: function (oEvent) {
        let tipoUp;
        let oModel;
        oEvent
          .getSource()
          .getParent()
          .getParent()
          .getId()
          .endsWith("idDocRdoTable") ||
        oEvent
          .getSource()
          .getParent()
          .getParent()
          .getId()
          .endsWith("idDocOdaTable")
          ? (tipoUp = "T")
          : (tipoUp = "P");
        this.getModel("upDetailAll").setProperty("/TIPO", tipoUp);
        this.getModel("detailRdoModel")
          ? (oModel = "detailRdoModel")
          : (oModel = "odaDetailModel");
        this.getModel("upDetailAll").setProperty(
          "/EBELN",
          this.getModel(oModel).getProperty("/number")
        );
        if (tipoUp == "P") {
          this.getModel("upDetailAll").setProperty(
            "/EBELP",
            oEvent.getSource().getBindingContext(oModel).getObject().EBELP
          );
        }
        Dialog.onOpenDialog(
          "nDialog",
          "rheinmetalassd.view.fragment.comDialog.maskAllegati",
          this
        );
      },
      onFileRdoOdaChange: async function (oEvent) {
        let oFileUploader = oEvent.getSource();
        let oFile =
          oEvent.getParameter("files") && oEvent.getParameter("files")[0];
        if (oFile) {
          if (!formatter.checkValidExt(oFile.name.split(".")[1])) {
            MessageBox.error(this.getBundleText("validFormat"));
            oEvent.getSource().setValue("");
            return;
          } else {
            this.getModel("upDetailAll").getProperty("/TIPO") === "T"
              ? this.getModel("upDetailAll").setProperty(
                  "/WSAPPLICATION",
                  oFile.name.split(".")[1].toUpperCase()
                )
              : this.getModel("upDetailAll").setProperty(
                  "/EXT",
                  oFile.name.split(".")[1].toUpperCase()
                );
          }
          this.getBase64(oFile)
            .then((base64) => {
              let fileBase64 = base64.split(",")[1];
              this.getModel("upDetailAll").setProperty("/FILE64", fileBase64);
            })
            .catch((error) => {
              MessageToast.show(this.getBundleText("fileError"));
            });
        } else {
          MessageToast.show(this.getBundleText("noFile"));
        }
      },
      onUploadRdoOda: async function (oEvent) {
        let oPayload;
        if (this.getModel("upDetailAll").getProperty("/TIPO") === "T") {
          //testata
          if (
            this.getModel("upDetailAll").getProperty("/DOCFILE") !== "" &&
            this.getModel("upDetailAll").getProperty("/EBELN") !== "" &&
            this.getModel("upDetailAll").getProperty("/FILE64") !== "" &&
            this.getModel("upDetailAll").getProperty("/WSAPPLICATION") !== ""
          ) {
            oPayload = {
              FILE64: this.getModel("upDetailAll").getProperty("/FILE64"),
              DOCFILE: this.getModel("upDetailAll").getProperty("/DOCFILE"),
              WSAPPLICATION:
                this.getModel("upDetailAll").getProperty("/WSAPPLICATION"),
              EBELN: this.getModel("upDetailAll").getProperty("/EBELN"),
            };
            this._uploadFileTestata(oEvent, oPayload);
          } else {
            MessageBox.error(this.getBundleText("reqData"));
          }
        } else {
          //posizione
          if (
            this.getModel("upDetailAll").getProperty("/DOCFILE") !== "" &&
            this.getModel("upDetailAll").getProperty("/EBELN") !== "" &&
            this.getModel("upDetailAll").getProperty("/EBELP") !== "" &&
            this.getModel("upDetailAll").getProperty("/FILE64") !== "" &&
            this.getModel("upDetailAll").getProperty("/EXT") !== ""
          ) {
            oPayload = {
              FILE64: this.getModel("upDetailAll").getProperty("/FILE64"),
              DOCFILE: this.getModel("upDetailAll").getProperty("/DOCFILE"),
              EXT: this.getModel("upDetailAll").getProperty("/EXT"),
              EBELN: this.getModel("upDetailAll").getProperty("/EBELN"),
              EBELP: this.getModel("upDetailAll").getProperty("/EBELP"),
              DOKAR: "ZRQ",
              DOKNR: "",
              DOKVR: "",
              DOKST: "",
              DOKTL: "",
            };
            this._uploadFilePosizione(oEvent, oPayload);
          } else {
            MessageBox.error(this.getBundleText("reqData"));
          }
        }
      },
      _uploadFileTestata: async function (oEvent, oPayload) {
        let oModel;
        this.getView().getControllerName() ===
        "rheinmetalassd.controller.DetailOda"
          ? (oModel = this.getModel("odaDetailModel"))
          : (oModel = this.getModel("detailRdoModel"));
        let that = this;
        this.showBusy(0);
        try {
          let respUplTest = await API.uploadAllTest(oPayload);
          this.onCloseDialog(oEvent);
          if (respUplTest.TYPE === "E") {
            MessageBox.error(respUplTest.MESSAGE);
          } else {
            MessageBox.success(respUplTest.MESSAGE, {
              actions: [sap.m.MessageBox.Action.CLOSE],
              onClose: async function (oAction) {
                if (oAction === sap.m.MessageBox.Action.CLOSE) {
                  await that.getAllegatiTestata(
                    {
                      EBELN: oModel.getProperty("/number"),
                      EBELP: "",
                      TIPO: "T",
                    },
                    that,
                    oModel
                  );
                }
              },
            });
          }
        } catch {
          MessageBox.error(this.getBundleText("errUpload"));
        } finally {
          this.refreshUploadDetailModel(this, "upDetailAll");
          this.hideBusy(0);
        }
      },
      _uploadFilePosizione: async function (oEvent, oPayload) {
        let that = this;
        let callFunc;
        this.getView().getControllerName() ===
        "rheinmetalassd.controller.DetailOda"
          ? (callFunc = "oda")
          : (callFunc = "rdo");

        this.showBusy(0);
        try {
          let respUplTest = await API.uploadAllPos(oPayload);
          this.onCloseDialog(oEvent);
          if (respUplTest.TYPE === "E") {
            MessageBox.error(respUplTest.MESSAGE);
          } else {
            MessageBox.success(respUplTest.MESSAGE, {
              actions: [sap.m.MessageBox.Action.CLOSE],
              onClose: async function (oAction) {
                if (oAction === sap.m.MessageBox.Action.CLOSE) {
                  if (callFunc === "rdo") {
                    await that.setDetailRdo(
                      that.getModel("detailRdoModel").getProperty("/number"),
                      that,
                      that.getModel("detailRdoModel")
                    );
                  } else {
                    await that.setDetailOda(
                      that.getModel("odaDetailModel").getProperty("/number"),
                      that,
                      that.getModel("odaDetailModel")
                    );
                  }
                }
              },
            });
          }
        } catch {
          MessageBox.error(this.getBundleText("errUpload"));
        } finally {
          this.refreshUploadDetailModel(this, "upDetailAll");
          this.hideBusy(0);
        }
      },
      refreshUploadDetailModel: function (that, modello) {
        let oModel = this.getModel(modello);
        let oData = oModel.getData();
        for (let property in oData) {
          if (oData.hasOwnProperty(property)) {
            oModel.setProperty("/" + property, "");
            oModel.refresh();
          }
        }
      },
      getAllegatiTestata: async function (
        { EBELN, EBELP, TIPO },
        that,
        oModel
      ) {
        let listaTestata;
        that.showBusy(0);
        try {
          if (
            that.getView().getControllerName() ===
            "rheinmetalassd.controller.DetailOda"
          ) {
            listaTestata = await API.getAllegatiOda({ EBELN, EBELP, TIPO });
            listaTestata = listaTestata.T_LISTA_ALLEGATI_ODA_T;
          } else {
            listaTestata = await API.getAllegatiRdo({ EBELN, EBELP, TIPO });
            listaTestata = listaTestata.T_LISTA_ALLEGATI_RDO_T;
          }
          for (let allegato of listaTestata) {
            allegato.visible = [
              "pdf",
              "jpg",
              "png",
              "PDF",
              "JPG",
              "PNG",
            ].includes(allegato.WSAPPLICATION);
          }
          oModel.setProperty("/testata/allegatiMatnr", listaTestata);
        } catch (error) {
          throw error;
        } finally {
          that.hideBusy(0);
        }
      },
      onOpenListaPosAllegato: async function (oEvent) {
        let bindingContext;
        let oModel;
        if (
          oEvent.getSource().getBindingContext("detailRdoModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("detailRdoModel");
          oModel = "detailRdoModel";
        } else if (
          oEvent.getSource().getBindingContext("odaDetailModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("odaDetailModel");
          oModel = "odaDetailModel";
        }
        let sPos = bindingContext.getObject().EBELP;
        await this.getAllegatiPos(sPos, oModel);
        Dialog.onOpenDialog(
          "pAllDialog",
          "rheinmetalassd.view.Fragment.comDialog.listaAllegati",
          this,
          "allegatiDialog"
        );
      },
      getAllegatiPos: async function (posizione, oModel) {
        this.showBusy(0);
        let listaPos;
        try {
          if (
            this.getView().getControllerName() ===
            "rheinmetalassd.controller.DetailOda"
          ) {
            listaPos = await API.getAllegatiOda({
              EBELN: this.getModel(oModel).getProperty("/number"),
              EBELP: posizione,
              TIPO: "P",
            });
            listaPos = listaPos.T_LISTA_ALLEGATI_ODA_P;
          } else {
            listaPos = await API.getAllegatiRdo({
              EBELN: this.getModel(oModel).getProperty("/number"),
              EBELP: posizione,
              TIPO: "P",
            });
            listaPos = listaPos.T_LISTA_ALLEGATI_RDO_P;
          }
          this.getModel("allegatiDialog").setProperty("/allegati", listaPos);
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      onSelectAllegato: async function (oEvent) {
        let self = this;
        let bindingContext;
        if (
          oEvent.getSource().getBindingContext("detailRdoModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("detailRdoModel");
        } else if (
          oEvent.getSource().getBindingContext("odaDetailModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("odaDetailModel");
        } else {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("allegatiDialog");
        }
        let oFileToSee = bindingContext.getObject();
        oFileToSee.GUID = oFileToSee.GUID || "";
        oFileToSee.TIPO = oFileToSee.GUID === "" ? "P" : "T";
        this.showBusy(0);
        try {
          let b64File = await API.getDetailAllegato({
            GUID: oFileToSee.GUID,
            DOKAR: oFileToSee.DOKAR,
            DOKNR: oFileToSee.DOKNR,
            DOKVR: oFileToSee.DOKVR,
            DOKTL: oFileToSee.DOKTL,
            TIPO: oFileToSee.TIPO,
          });
          let blob = self.base64ToBlob(b64File.FILE64, "application/pdf");
          let _Url = URL.createObjectURL(blob);
          jQuery.sap.addUrlWhitelist("blob");
          let oSource = {
            src: _Url,
            alt: b64File.DARTXT,
          };
          let oModel = new JSONModel(oSource);
          if (b64File.EXT === "PDF" || b64File.EXT === "pdf") {
            this.setModel(oModel, "pdfModel");
            Dialog.onOpenDialog(
              "tpdfDialog",
              "rheinmetalassd.view.Fragment.comDialog.pdfDialog",
              self,
              "pdfModel"
            );
          } else if (
            b64File.EXT === "png" ||
            b64File.EXT === "PNG" ||
            b64File.EXT === "jpeg" ||
            b64File.EXT === "JPEG"
          ) {
            this.setModel(oModel, "imageModel");
            Dialog.onOpenDialog(
              "tAllDialog",
              "rheinmetalassd.view.Fragment.comDialog.pdfAllegato",
              self,
              "imageModel"
            );
          } else {
            this.createDownloadLink({
              FILE64: b64File.FILE64,
              EXT: b64File.EXT,
              DARTXT: b64File.DARTXT,
            });
          }
        } catch (error) {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      base64ToBlob: function (base64, mimeType) {
        base64 = base64.replaceAll("-", "+").replaceAll("_", "/");
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
      },
      onDownloadAllT: async function (oEvent) {
        let oBindingContext;
        oEvent.getSource().getBindingContext("detailRdoModel") === undefined
          ? (oBindingContext = oEvent
              .getSource()
              .getBindingContext("odaDetailModel"))
          : (oBindingContext = oEvent
              .getSource()
              .getBindingContext("detailRdoModel"));

        let fileToDownload = oBindingContext.getObject();
        try {
          let b64File = await API.getDetailAllegato({
            GUID: fileToDownload.GUID,
            DOKAR: "",
            DOKNR: "",
            DOKVR: "",
            DOKTL: "",
            TIPO: "T",
          });
          this.createDownloadLink({
            FILE64: b64File.FILE64,
            EXT: b64File.EXT,
            DARTXT: b64File.DARTXT,
          });
        } catch (error) {
          MessageBox.error(this.getBundleText("genError"));
        }
      },
      onOpenListaPosTesti: async function (oEvent) {
        let bindingContext;
        let oModel;
        if (
          oEvent.getSource().getBindingContext("detailRdoModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("detailRdoModel");
          oModel = "detailRdoModel";
        } else if (
          oEvent.getSource().getBindingContext("odaDetailModel") !== undefined
        ) {
          bindingContext = oEvent
            .getSource()
            .getBindingContext("odaDetailModel");
          oModel = "odaDetailModel";
        }
        let sPos = bindingContext.getObject().EBELP;
        await this.getTestiPos(sPos, oModel);
        Dialog.onOpenDialog(
          "pTestDialog",
          "rheinmetalassd.view.Fragment.comDialog.listaTesti",
          this,
          "testiDialog"
        );
      },
      getTestiPos: async function (posizione, oModel) {
        this.showBusy(0);
        try {
          let listaPos = await API.getTesti({
            EBELN: this.getModel(oModel).getProperty("/number"),
            EBELP: posizione,
            TIPO: "P",
          });
          listaPos = listaPos.TESTI;
          this.getModel("testiDialog").setProperty("/testi", listaPos);
          this.getModel("testiDialog").setProperty(
            "/EBELN",
            this.getModel(oModel).getProperty("/number")
          );
          this.getModel("testiDialog").setProperty("/EBELP", posizione);
          this.getModel("testiDialog").setProperty("/TIPO", "P");
        } catch {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      onOpenTesti: async function (oEvent, self, oTesto) {
        let oView = this.getView();
        let oButton = oEvent.getSource();
        let oModel;
        this.getView().getControllerName() ===
        "rheinmetalassd.controller.DetailOda"
          ? (oModel = this.getModel("odaDetailModel"))
          : (oModel = this.getModel("detailRdoModel"));
        let oSelected;
        let sEbeln;
        let sEbelp;
        let sTipo;
        if (oEvent.getSource().getBindingContext("testiDialog") !== undefined) {
          oSelected = oEvent
            .getSource()
            .getBindingContext("testiDialog")
            .getObject();
          sEbeln = this.getModel("testiDialog").getProperty("/EBELN");
          sEbelp = this.getModel("testiDialog").getProperty("/EBELP");
          sTipo = this.getModel("testiDialog").getProperty("/TIPO");
        } else {
          oSelected = oTesto;
          sEbeln = oModel.getProperty("/number");
          sEbelp = "";
          sTipo = "T";
        }
        this.showBusy(0);
        try {
          let oDetText = await API.getDetailTesto({
            EBELN: sEbeln,
            EBELP: sEbelp,
            TIPO: sTipo,
            TDID: oSelected.TDID,
            TDSPRAS: oSelected.TDSPRAS,
          });
          oDetText = oDetText.TESTO;
          let oFormattedText = oDetText.map((item) => item.TDLINE).join("\n");
          this.onOpenPopoverText(oFormattedText, oView, oButton);
        } catch (error) {
          MessageBox.error(this.getBundleText("genError"));
        } finally {
          this.hideBusy(0);
        }
      },
      onOpenPopoverText: function (oDetText, oView, oButton) {
        if (!this._qPopover) {
          this._pPopover = Fragment.load({
            id: oView.getId(),
            name: "rheinmetalassd.view.Fragment.comDialog.testoEsteso",
            controller: this,
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            const oJsonModel = new JSONModel({
              testo: oDetText,
            });
            oPopover.setModel(oJsonModel, "testiPopover");
            return oPopover;
          });
        }
        this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });
      },
      onChangeStato: async function (oEvent, id, oModel) {
        let that = this;
        let selectedIndices = this.byId(id).getSelectedIndices();
        if (selectedIndices.length > 0) {
          const aPosizioni = this.getModel(oModel).getProperty("/posizioni");
          let sStato;
          let check;
          let aSelected = [];
          oEvent.getSource().getText() === "Acquisisci" ||
          oEvent.getSource().getText() === "Confirm"
            ? (sStato = "V")
            : (sStato = "R");
          selectedIndices.map((index) => {
            const selectedItem = aPosizioni[index];
            if (selectedItem.stato === "sap-icon://status-in-process") {
              selectedItem.EBELP = String(selectedItem.EBELP);
              selectedItem.EBELP = ("00" + selectedItem.EBELP).padStart(5, "0");
              selectedItem.EBELP = selectedItem.EBELP.substring(
                selectedItem.EBELP.length - 5
              );
              aSelected.push({
                EBELN: this.getModel(oModel).getProperty("/number"),
                EBELP: selectedItem.EBELP,
                STATO: sStato,
              });
            } else {
              return (check = false);
            }
          });
          if (aSelected.length > 0) {
            this.showBusy(0);
            try {
              let changeStat;
              let callFunc;
              if (oModel === "detailRdoModel") {
                changeStat = await API.changeStatoRdo({
                  lista_stato_rdo: aSelected,
                });
                changeStat = changeStat.E_LISTA_STATO_RDO;
                callFunc = this.setDetailRdo;
              } else {
                changeStat = await API.changeStatoOda({
                  lista_stato_oda: aSelected,
                });
                changeStat = changeStat.E_LISTA_STATO_ODA;
                callFunc = this.setDetailOda;
              }
              this.handleApiCall(changeStat, oModel, callFunc, this);
            } catch {
              MessageBox.error(that.getBundleText("genError"));
            } finally {
              this.byId(id).clearSelection();
              this.hideBusy(0);
            }
          } else {
            MessageBox.error(this.getBundleText("ErrorPoscambiate"));
          }
        } else {
          MessageBox.error(this.getBundleText("selPos"));
        }
        selectedIndices = [];
      },
      handleApiCall: async function (changeStat, oModel, func, that) {
        let allSuccess = true;
        let errorMessages = "";
        let successMessages = "";

        changeStat.forEach((item) => {
          if (item.ERRORE === "E") {
            allSuccess = false;
            errorMessages += `${that.getBundleText("posizione")} ${
              item.EBELP
            }: ${item.MESSAGGIO}\n`;
          } else if (item.ERRORE === "S") {
            successMessages += `${that.getBundleText("posizione")} ${
              item.EBELP
            }: ${item.MESSAGGIO}\n`;
          }
        });

        if (allSuccess) {
          MessageBox.success(successMessages, {
            actions: [sap.m.MessageBox.Action.CLOSE],
            onClose: async function (oAction) {
              if (oAction === sap.m.MessageBox.Action.CLOSE) {
                await func(
                  that.getModel(oModel).getProperty("/number"),
                  that,
                  that.getModel(oModel)
                );
              }
            },
          });
        } else {
          let finalMessage = errorMessages + "\n" + successMessages;
          MessageBox.error(finalMessage, {
            actions: [sap.m.MessageBox.Action.CLOSE],
            onClose: async function (oAction) {
              if (oAction === sap.m.MessageBox.Action.CLOSE) {
                await func(
                  that.getModel(oModel).getProperty("/number"),
                  that,
                  that.getModel(oModel)
                );
              }
            },
          });
        }
      },
      showBusy: function (delay) {
        // sap.ui.core.BusyIndicator.show(delay || 0);
        sap.ui.core.BusyIndicator.show(delay);
      },
      hideBusy: function (delay) {
        // sap.ui.core.BusyIndicator.hide(delay || 0);
        sap.ui.core.BusyIndicator.hide(delay);
      },
    });
  }
);
