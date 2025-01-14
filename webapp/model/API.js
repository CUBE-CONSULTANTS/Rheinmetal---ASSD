sap.ui.define([], function () {
  "use strict";

  const bsp = " /sap/zassd_rest";
  const endpoint = bsp;

  return {
    createEntity: function ({ entity, data }) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: endpoint + entity,
          headers: {
            ACTION: "001",
            USER_AD: "marco.trotta",
            "sap-client": "500",
            "sap-sessioncmd": "open",
            Accept: "application/json",
          },
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: (res) => {
            try {
              let parsedResponse;
              if (typeof res === "string") {
                const hasInvalidChars = /[\u0000-\u001F\u007F-\u009F]/.test(
                  res
                );
                if (hasInvalidChars) {
                  let cleanedResponse = res.replace(
                    /[\u0000-\u001F\u007F-\u009F]/g,
                    ""
                  );
                  parsedResponse = JSON.parse(cleanedResponse);
                } else {
                  parsedResponse = JSON.parse(res);
                }
              } else {
                parsedResponse = res;
              }
              resolve(parsedResponse);
            } catch (error) {
              reject(error);
            }
          },
          error: (e) => reject(e),
        });
      });
    },

    getAnagrafica: async function (data) {
      return await this.createEntity({
        entity: "/zst_assd_cliente.json",
        data: data,
      });
    },
    // getFornitore: async function ({ lifnr }) {
    //   return await this.createEntity({
    //     entity: "/get_fornitore.json",
    //     data: { lifnr },
    //   });
    // },
    // getListaFornitori: async function ({ LIFNR, NAME1, COUNTRY, STCEG }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_fornitori.json",
    //     data: { LIFNR, NAME1, COUNTRY, STCEG },
    //   });
    // },
    // getFornitoreMc: async function () {
    //   return await this.createEntity({
    //     entity: "/get_fornitore_mc.json",
    //   });
    // },
    // getMaterialeMc: async function ({ MATNR }) {
    //   return await this.createEntity({
    //     entity: "/get_materiale_mc.json",
    //     data: { MATNR },
    //   });
    // },
    // getDocBOM: async function ({ EBELN }) {
    //   return await this.createEntity({
    //     entity: "/download_doc_bom.json",
    //     data: { EBELN },
    //   });
    // },
    // getDivisaMc: async function () {
    //   return await this.createEntity({
    //     entity: "/get_divisa_mc.json",
    //   });
    // },
    // getRdoOdaKey: async function ({ EBELN, TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_offerta_mc.json",
    //     data: { EBELN, TIPO },
    //   });
    // },
    // getStatoRdo: async function ({ TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_stato_rdo_mc.json",
    //     data: { TIPO },
    //   });
    // },
    // getListaAllegati: async function ({ LIFNR, TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_allegati.json",
    //     data: { LIFNR, TIPO },
    //   });
    // },
    // getTipoAllegatiMc: async function () {
    //   return await this.createEntity({
    //     entity: "/get_tpallegati_mc.json",
    //   });
    // },
    // getFileDms: async function ({ DOKAR, DOKNR, DOKVR, DOKTL }) {
    //   return await this.createEntity({
    //     entity: "/get_file_dms.json",
    //     data: { DOKAR, DOKNR, DOKVR, DOKTL },
    //   });
    // },
    // getTemplateList: async function () {
    //   return await this.createEntity({
    //     entity: "/get_lista_template.json",
    //   });
    // },
    // getTemplateFile: async function ({ DOKAR, PROGR }) {
    //   return await this.createEntity({
    //     entity: "/get_file_template.json",
    //     data: { DOKAR, PROGR },
    //   });
    // },
    // uploadTemplate: async function ({
    //   DOKAR,
    //   DATA_INI,
    //   DATA_FINE,
    //   FILE64,
    //   EXT,
    //   DATA_CREA,
    // }) {
    //   return await this.createEntity({
    //     entity: "/upload_file_template.json",
    //     data: { DOKAR, DATA_INI, DATA_FINE, FILE64, EXT, DATA_CREA },
    //   });
    // },
    // uploadDms: async function ({
    //   DOKAR,
    //   DOKNR,
    //   DOKVR,
    //   DOKTL,
    //   DOKST,
    //   OBJKY,
    //   DATA_INI,
    //   DATA_FINE,
    //   FILE64,
    //   EXT,
    // }) {
    //   return await this.createEntity({
    //     entity: "/upload_allegatidms.json",
    //     data: {
    //       DOKAR,
    //       DOKNR,
    //       DOKVR,
    //       DOKTL,
    //       DOKST,
    //       OBJKY,
    //       DATA_INI,
    //       DATA_FINE,
    //       FILE64,
    //       EXT,
    //     },
    //   });
    // },
    // deleteTemplates: async function ({ DOKAR, PROGR }) {
    //   return await this.createEntity({
    //     entity: "/delete_file_template.json",
    //     data: { DOKAR, PROGR },
    //   });
    // },
    // setChangeStatus: async function ({ DOKAR, DOKNR, DOKVR, DOKTL, DOKST }) {
    //   return await this.createEntity({
    //     entity: "/change_status_dms.json",
    //     data: { DOKAR, DOKNR, DOKVR, DOKTL, DOKST },
    //   });
    // },
    // getListaRdo: async function ({
    //   EINDT_DA,
    //   EINDT_A,
    //   MATNR,
    //   LIFNR,
    //   STATO,
    //   EBELN,
    // }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_rdo.json",
    //     data: { EINDT_DA, EINDT_A, MATNR, LIFNR, STATO, EBELN },
    //   });
    // },
    // getDetailRdo: async function ({ EBELN }) {
    //   return await this.createEntity({
    //     entity: "/get_detail_rdo.json",
    //     data: { EBELN },
    //   });
    // },
    // getAllegatiRdo: async function ({ EBELN, EBELP, TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_allegati_rdo.json",
    //     data: { EBELN, EBELP, TIPO },
    //   });
    // },
    // getAllegatiOda: async function ({ EBELN, EBELP, TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_allegati_oda.json",
    //     data: { EBELN, EBELP, TIPO },
    //   });
    // },
    // getDetailAllegato: async function ({
    //   GUID,
    //   DOKAR,
    //   DOKNR,
    //   DOKVR,
    //   DOKTL,
    //   TIPO,
    // }) {
    //   return await this.createEntity({
    //     entity: "/get_detail_allegato.json",
    //     data: { GUID, DOKAR, DOKNR, DOKVR, DOKTL, TIPO },
    //   });
    // },
    // getTesti: async function ({ EBELN, EBELP, TIPO }) {
    //   return await this.createEntity({
    //     entity: "/get_testi.json",
    //     data: { EBELN, EBELP, TIPO },
    //   });
    // },
    // getDetailTesto: async function ({ EBELN, EBELP, TIPO, TDID, TDSPRAS }) {
    //   return await this.createEntity({
    //     entity: "/get_detail_testo.json",
    //     data: { EBELN, EBELP, TIPO, TDID, TDSPRAS },
    //   });
    // },
    // uploadAllTest: async function ({ FILE64, DOCFILE, WSAPPLICATION, EBELN }) {
    //   return await this.createEntity({
    //     entity: "/upload_all_tes.json",
    //     data: { FILE64, DOCFILE, WSAPPLICATION, EBELN },
    //   });
    // },
    // uploadAllPos: async function ({
    //   DOKAR,
    //   DOKNR,
    //   DOKVR,
    //   DOKTL,
    //   DOKST,
    //   EBELN,
    //   EBELP,
    //   FILE64,
    //   EXT,
    //   DOCFILE,
    // }) {
    //   return await this.createEntity({
    //     entity: "/upload_all_pos.json",
    //     data: {
    //       DOKAR,
    //       DOKNR,
    //       DOKVR,
    //       DOKTL,
    //       DOKST,
    //       EBELN,
    //       EBELP,
    //       FILE64,
    //       EXT,
    //       DOCFILE,
    //     },
    //   });
    // },
    // changePosRdo: async function ({ lista_rdo }) {
    //   return await this.createEntity({
    //     entity: "/change_pos_rdo.json",
    //     data: { lista_rdo },
    //   });
    // },
    // changeStatoRdo: async function ({ lista_stato_rdo }) {
    //   return await this.createEntity({
    //     entity: "/change_stato_rdo.json",
    //     data: { lista_stato_rdo },
    //   });
    // },
    // getListaOda: async function ({
    //   EINDT_DA,
    //   EINDT_A,
    //   MATNR,
    //   LIFNR,
    //   STATO,
    //   EBELN,
    // }) {
    //   return await this.createEntity({
    //     entity: "/get_lista_oda.json",
    //     data: { EINDT_DA, EINDT_A, MATNR, LIFNR, STATO, EBELN },
    //   });
    // },
    // getDetailOda: async function ({ EBELN }) {
    //   return await this.createEntity({
    //     entity: "/get_detail_oda.json",
    //     data: { EBELN },
    //   });
    // },
    // changeStatoOda: async function ({ lista_stato_oda }) {
    //   return await this.createEntity({
    //     entity: "/change_stato_oda.json",
    //     data: { lista_stato_oda },
    //   });
    // },
    // changePosOda: async function ({ lista_oda }) {
    //   return await this.createEntity({
    //     entity: "/change_pos_oda.json",
    //     data: { lista_oda },
    //   });
    // },
    // getUserRole: async function () {
    //   return await this.createEntity({
    //     entity: "/get_user_role.json",
    //   });
    // },
  };
});
