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
			createRicercaFornitoreModel: function () {
				return new JSONModel({
					filterbar: {
						Fornitore: {
							value: null,
							items: [],
						},
						Descrizione: {
							value: null,
							items: [],
						},
						Paese: {
							value: null,
							items: [],
						},
						Piva: {
							value: null,
							items: [],
						},
					},
					fornitori: [],
				});
			},
      CreateDocumentiModel: function(){
        return new JSONModel({ 
          nameForn: "",
          enabled: true
        })
      },
      CreateTemplateModel:function(){
        return new JSONModel({ 
          
        })
      },
      CreateValidationiModel: function(){
        return new JSONModel({ 
          value: "",
          items: [
            {
              "key": "",
              "text": ""
            },
            {
              "key": "Validato",
              "text": "Validato"
            },
            {
              "key": "Non validato",
              "text": "Non validato"
            }
          ]
        })
      },
      createUpDocDialogModel: function () {
				return new JSONModel({
					dataInizio: null,    
					dataFine: null,  
					tipoDocumento: {
            selected: "",
            items:[]
          },
					file: null,            
					editable: true,        
				});
			},
			CreateAnagraficaModel: function () {
				return new JSONModel({
					AUDIT: "",
					CITY1: "",
					COUNTRY: "",
					DUNS: "",
					GRCONTI: "",
					IBAN: "",
					LANGU: "",
					LIFNR: "",
					NAME1: "",
					POST_CODE1: "",
					REGION: "",
					SMPT_ADDR1: "",
					SMPT_ADDR2: "",
					SMPT_ADDR3: "",
					STCEG: "",
					STREET: "",
					TELF1: "",
					TELFX: "",
					VERKF: "",
				});
			},
			createNuoviTemplateModel: function () {
				return new JSONModel({
					templateData: {
						id: null,
						dataCaricamento: null,
						fineValidita: null,
						giorniValidita: null,
						dataRilascio: null,
						file: null,
					},
				});
			},
			createCommonMcModel: function () {
				return new JSONModel({
					filterbar: {
						Consegna: {
							value: null,
						},
						Materiale: {
							value: null,
              items:[]
						},
						Fornitore: {
							value: null,
              items: []
						},
						Stato: {
							value: null,
							items: [],
						},
					},
				});
			},
      createDivisaModel: function () {
        return new JSONModel({
          value: null, 
          items: [
           
          ]
        })
      },
      createFilterDialogRdo: function () {
        return new JSONModel({
          richiesta: null, 
          fornitore: null, 
          materiale: null, 
          dataVal: null, 
          consegna: null, 
          stato:{
          value: null,
          key:null,
           items: [
              { key: "A", text: "Non compilato"},
              { key: "V", text: "Approvato"},
              { key: "G", text: "In attesa"},
              { key: "R", text: "Rifiutato"},
            ]
          } 
        })
      },
      createRichiesteOffertaModel:function(){
        return new JSONModel({
        richiesteOfferta: []
        })
      },
			createRdoDettaglioModel: function () {
				return new JSONModel({
					testata: {
            testi:[],
            allegatiMatnr:[],
          },
          posizioni:[
            
          ]
				});
			},
      createListaAllPos: function () {
        return new JSONModel({
          allegati: [],
				});
      },
      createListaTestiPos: function () {
        return new JSONModel({
          EBELN:"",
          EBELP:"",
          TIPO:"",
          testi: [],
				});
      },
      createUplFile: function () {
        return new JSONModel({
          DOKAR: "",
          DOKNR: "",
          DOKVR: "",
          DOKTL: "",
          DOKST: "",
          EBELN: "",
          EBELP: "",
          FILE64: "",
          EXT: "",
          DOCFILE: "",
          WSAPPLICATION: "",
          FILE: "",
          TIPO: "",
				});
      },
			createOrdiniAcquistoModel:function () {
        return new JSONModel({
        ordiniAcquisto: []
        })
      },
			createDettaglioOdaModel: function () {
				return new JSONModel({
            testata: {
              testi:[],
              allegatiMatnr:[],
            },
            posizioni:[
              
            ]
          });
			},
		};
	}
);
