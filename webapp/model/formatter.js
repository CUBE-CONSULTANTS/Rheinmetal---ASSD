sap.ui.define([
  "sap/ui/core/format/DateFormat" 
], function (DateFormat) {
  "use strict";

	return {
		formatValue: function (value) {
			return value && value.toUpperCase();
		},
		formatDate: function (dateString) {
			if (dateString === "0000-00-00") {
				return "";
			}
			let oDateFormat = DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy",
			});
			let oDate = new Date(dateString);
			return oDateFormat.format(oDate);
		},
    returnDate: function (sVal,inpPatForm,OutPatForm){
      if (sVal === "" || sVal === undefined || sVal === null) {
          return "";
        }      
        let inputFormat = DateFormat.getDateInstance({
            pattern: inpPatForm
        });
        let inputDate = inputFormat.parse(sVal);
        let outputFormat = DateFormat.getDateInstance({
          pattern: OutPatForm
        });
        return outputFormat.format(inputDate);   
    },
    checkValidExt: function(ext){
      const extUpperCase = ext.toUpperCase();
      if(extUpperCase === "DOC" || extUpperCase === "JPG" || extUpperCase === "PNG" || extUpperCase ==="XLS" || extUpperCase === "ZIP" || extUpperCase === "PDF"){
        return true
      }
      return false
    },
    convertToDate: function(dateString) {
      
      const parts = dateString.split('/');
      return new Date(parts[2], parts[1] - 1, parts[0]);
    },
    parseDate: function(dateStr) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day); 
    }
	};
});
