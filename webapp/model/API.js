sap.ui.define(["./Auth"], function (Auth) {
  "use strict";

  const bsp = "/ias/sap";
  const bspLocal = "/sap/zassd_rest";

  const endpoint = bsp;
  const endpointLocal = bspLocal;

  return {
    createEntity: function ({ entity, data }) {
      return new Promise((resolve, reject) => {
        const {
          user_token: { value },
        } = JSON.parse(localStorage.rheinmetall_user_data);

        $.ajax({
          url: endpoint + entity,
          headers: {
            Authorization: `Bearer ${value}`,
            "sap-client": "500",
            "sap-sessioncmd": "open",
            Accept: "application/json",
          },
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: (res) => {
            try {
              let parsedResponse = JSON.parse(res);

              resolve(parsedResponse);
            } catch (error) {
              reject(error);
            }
          },
          error: (e) => {
            reject(e);
            Auth._redirectLaunchpad();
          },
        });
      });
    },

    createEntityLocal: function ({ entity, data }) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: endpointLocal + entity,
          headers: {
            "sap-client": "500",
            "sap-sessioncmd": "open",
            Accept: "application/json",
          },
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: (res) => {
            try {
              let parsedResponse = JSON.parse(res);

              resolve(parsedResponse);
            } catch (error) {
              reject(error);
            }
          },
          error: (e) => {
            reject(e);
          },
        });
      });
    },

    getAnagrafica: async function (data) {
      return await this.createEntity({
        entity: "/zst_assd_cliente",
        data: data,
      });
    },

    getAnagraficaLocal: async function (data) {
      return await this.createEntityLocal({
        entity: "/zst_assd_cliente",
        data: data,
      });
    },
  };
});
