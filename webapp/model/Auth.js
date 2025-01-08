sap.ui.define(["./API"], function (API) {
  "use strict";
  return {
      login: async function ({ username }) {
          API.createEntity({
              entity: "/sap/bc/bsp/sap/zui5_dst/userset.json",
              data: { iv_uname: username },
          })
              .then((res) => JSON.parse(res))
              .catch((err) => err);
      },
  };
});