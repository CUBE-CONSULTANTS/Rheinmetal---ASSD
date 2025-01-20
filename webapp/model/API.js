sap.ui.define(["./Auth"], function (Auth) {
  "use strict";

  const bsp = "/ias/sap";
  const endpoint = bsp;

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
          error: (e) => {
            reject(e);
            Auth._redirectLaunchpad();
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
  };
});
