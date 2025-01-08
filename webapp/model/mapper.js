sap.ui.define(
	["../model/API", "../model/formatter"],
	function (API, formatter) {
		"use strict";
		return {
			setIconColor: function (array) {
				array.forEach((element) => {
					if (element.STATO === "V" || element.DOKST === "Z2") {
						element.colore = "green";
						element.STATO = "sap-icon://status-positive";
					} else if (element.DOKST === "") {
						element.colore = "orangered";
						element.STATO = "sap-icon://decline";
					} else if (element.DOKST === "Z4") {
						element.colore = "dimgray";
						element.STATO = "sap-icon://cancel";
					} else if (element.DOKST === "A1") {
						element.colore = "orangered";
						element.STATO = "sap-icon://pending";
					} else if (element.STATO === "G" || element.DOKST === "Z1") {
						element.colore = "gold";
						element.STATO = "sap-icon://status-in-process";
					} else if (element.STATO === "R" || element.DOKST === "Z3") {
						element.colore = "red";
						element.STATO = "sap-icon://status-negative";
					} else {
						element.colore = "darkgray";
						element.STATO = "sap-icon://status-in-process";
					}
				});
			},
			setIconColorString: function (statusString) {
				let result = {
					colore: "darkgray",
					icon: "sap-icon://status-in-process",
				};
				if (statusString === "V") {
					result.colore = "green";
					result.icon = "sap-icon://status-positive";
				} else if (statusString === "G") {
					result.colore = "gold";
					result.icon = "sap-icon://status-in-process";
				} else if (statusString === "A") {
					result.colore = "orangered";
					result.icon = "sap-icon://decline";
				} else if (statusString === "R") {
					result.colore = "red";
					result.icon = "sap-icon://status-negative";
				}
				return result;
			},
			mapRdoList: function (oListaRdo) {
				let mappaRichieste = {};
				oListaRdo.T_LISTA_RDO.forEach((rdo) => {
					if (!mappaRichieste[rdo.EBELN]) {
						const stato = this.setIconColorString(rdo.STATO);
						mappaRichieste[rdo.EBELN] = {
							richiesta: rdo.EBELN,
							fornitore: rdo.LIFNR,
							descrizione: rdo.NAME1,
							stato: stato.icon,
							colore: stato.colore,
							dataVal: formatter.formatDate(rdo.ANGDT),
              check: {visible : true, selected: false},
							posizioni: [],
						};
					}
					mappaRichieste[rdo.EBELN].posizioni.push({
						posizione: rdo.EBELP,
						Materiale: rdo.MATNR,
						testo_breve: rdo.TXZ01,
						data: formatter.formatDate(rdo.EINDT),
						udm: rdo.MEINS,
						quantita: rdo.KTMNG,
						lead: rdo.LEADTIME,
						price: rdo.NETPR,
						divisa: rdo.WAERS,
            check: {visible : false, selected: false},
					});
				});
				return Object.values(mappaRichieste);
			},
      mapOdaList: function (oListaOda) {
				let mappaOrdini = {};
				oListaOda.T_LISTA_ODA.forEach((oda) => {
					if (!mappaOrdini[oda.EBELN]) {
						const stato = this.setIconColorString(oda.STATO);
						mappaOrdini[oda.EBELN] = {
							ordine: oda.EBELN,
							fornitore: oda.LIFNR,
							descrizione: oda.NAME1,
							stato: stato.icon,
							colore: stato.colore,
							dataVal: formatter.formatDate(oda.BEDAT),
              check: {visible : true, selected: null},
							posizioni: [],
						};
					}
					mappaOrdini[oda.EBELN].posizioni.push({
						posizione: oda.EBELP,
						Materiale: oda.MATNR,
						testo_breve: oda.TXZ01,
						data: formatter.formatDate(oda.EINDT),
						udm: oda.MEINS,
						quantita: oda.KTMNG,
						price: oda.NETPR,
						divisa: oda.WAERS,
            check: {visible : false, selected: null}
					});
				});
				return Object.values(mappaOrdini);
			},
      flatData: function (data) {
        const flatData = []
          data.forEach(item => {
            let flatItem = { ...item };
            if (flatItem.stato) {
              switch (flatItem.stato) {
                case "sap-icon://status-negative":
                  flatItem.stato = "Rifiutato";
                  break;
                case "sap-icon://status-positive":
                  flatItem.stato = "Validato";
                  break;
                case "sap-icon://status-in-process":
                  flatItem.stato = "In Attesa";
                  break;
                default:
                  flatItem.stato = "Non compilato";
                  break;
              }
            }
              flatData.push(flatItem);
              if (Array.isArray(item.posizioni) && item.posizioni.length > 0) {
                item.posizioni.forEach(posizione => {
                    flatData.push({
                        ...posizione,
                        isPosition: true
                    });
                });
            }
        });
        return flatData;
      },
			setDocumentList: function (allegati, oValidationModel, tipo) {		
				return allegati.map((element) => {
					element.validazione = { ...oValidationModel };
					if (element.DOKST === "Z4") {
						element.DATA_INI = "0000-00-00";
						element.DATA_SCAD = "0000-00-00";
					}
					element.DATA_CREA = formatter.formatDate(element.DATA_CREA);
					element.DATA_INI = formatter.formatDate(element.DATA_INI);
					element.DATA_SCAD = formatter.formatDate(element.DATA_SCAD);

					if (tipo === "F") {
						if (element.DOKST === "Z1" || element.DOKST === "Z2") {
							element.enabledUp = false;
						}
						if (element.DOKST === "Z3" || element.DOKST === "A1") {
							element.enabledUp = true;
						}
					}
					if (tipo === "I") {
						if (element.DOKST === "" || element.DOKST === "Z4") {
							element.enabled = false;
							element.enabledsel = false;
						}
						if (element.DOKST === "A1") {
							element.enabledsel = false;
						}
					}
					if (element.DOKST === "Z2" || element.DOKST === "Z3") {
						element.enabledsel = false;
						element.validazione.value = element.DOSTX;
					} else {
						element.validazione.value = "";
					}
					return element;
				});
			},
			assDocTypeToTemplate: async function (docType) {
				try {
					let templateList = await API.getTemplateList();
					templateList = templateList.T_LISTA_TEMPLATE;
					let selectedEl = templateList.find(
						(element) => element.DOKAR === docType
					);
					return selectedEl.PROGR;
				} catch (error) {
					return error;
				}
			},
			convertFileExtensionToBase64DataType: function ({ fileExtension }) {
				let dataType = "";
				switch (fileExtension.toUpperCase()) {
					case "TXT":
						dataType = "text/plain";
						break;
					case "CSV":
						dataType = "text/csv";
						break;
					case "PDF":
						dataType = "application/pdf";
						break;
					case "DOC":
						dataType = "application/msword";
						break;
					case "DOCX":
						dataType =
							"application/vnd.openxmlformats-officedocument.wordprocessingml.document";
						break;
					case "XLS":
						dataType = "application/vnd.ms-excel";
						break;
					case "XLSX":
						dataType =
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
						break;
					case "PPT":
						dataType = "application/vnd.ms-powerpoint";
						break;
					case "PPTX":
						dataType =
							"application/vnd.openxmlformats-officedocument.presentationml.presentation";
						break;
					case "JPG":
						dataType = "image/jpeg";
						break;
					case "JPEG":
						dataType = "image/jpeg";
						break;
					case "PNG":
						dataType = "image/png";
						break;
					case "ZIP":
						dataType = "application/zip";
						break;
					case "TAR":
						dataType = "application/x-tar";
						break;
					case "GZ":
						dataType = "application/gzip";
						break;
					case "7Z":
						dataType = "application/x-7z-compressed";
						break;
					default:
						break;
				}

				return { dataType, error: !dataType ? true : false };
			},
		};
	}
);
