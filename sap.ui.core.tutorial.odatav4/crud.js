sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("my.app.controller.Main", {

        onInit: function () {
            // ViewModel for UI state (Local only)
            var oViewModel = new JSONModel({
                isBusy: false,
                hasChanges: false
            });
            this.getView().setModel(oViewModel, "appView");
        },

        // ============================================================
        // CREATE (C)
        // ============================================================
        onAddUser: function () {
            var oTable = this.byId("peopleTable"),
                oListBinding = oTable.getBinding("items");

            // .create() returns a 'Transient Context'
            var oNewContext = oListBinding.create({
                "UserName": "NewUser2026",
                "FirstName": "First",
                "LastName": "Last",
                "Age": 25
            });

            // Handle success/failure after the backend call
            oNewContext.created().then(function () {
                MessageToast.show("User created on server.");
            }, function (oError) {
                MessageBox.error("Creation failed: " + oError.message);
            });
            
            this._updateUIState();
        },

        // ============================================================
        // READ (R)
        // ============================================================
        onRefresh: function () {
            var oBinding = this.byId("peopleTable").getBinding("items");

            if (oBinding.hasPendingChanges()) {
                MessageBox.error("Please save or reset changes before refreshing.");
                return;
            }

            oBinding.refresh();
            MessageToast.show("Data reloaded from server.");
        },

        // ============================================================
        // UPDATE (U)
        // ============================================================
        // Note: Manual update. Usually, Two-Way Binding handles this automatically.
        onUpdateFirstName: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            
            // Set property locally - triggers a PATCH in the batch group
            oContext.setProperty("FirstName", "UpdatedName");
            
            this._updateUIState();
        },

        // ============================================================
        // DELETE (D)
        // ============================================================
        onDeleteUser: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();

            oContext.delete().then(function () {
                MessageToast.show("User deleted.");
            }, function (oError) {
                MessageBox.error("Delete failed: " + oError.message);
            });
        },

        // ============================================================
        // BATCH MANAGEMENT (Save / Cancel)
        // ============================================================
        onSave: function () {
            var oModel = this.getView().getModel(),
                oViewModel = this.getView().getModel("appView");

            oViewModel.setProperty("/isBusy", true);

            // Submits all PATCH, POST, and DELETE requests in the group
            oModel.submitBatch("myAppUpdateGroup").then(function () {
                oViewModel.setProperty("/isBusy", false);
                MessageToast.show("All changes saved to backend.");
            }.bind(this)).catch(function (oError) {
                oViewModel.setProperty("/isBusy", false);
                MessageBox.error("Batch submission failed.");
            });
        },

        onResetChanges: function () {
            // Discards all local edits and transient contexts
            this.getView().getModel().resetChanges("myAppUpdateGroup");
            MessageToast.show("Changes discarded.");
            this._updateUIState();
        },

        // Internal helper to track if 'Save' button should be enabled
        _updateUIState: function () {
            var bHasChanges = this.getView().getModel().hasPendingChanges();
            this.getView().getModel("appView").setProperty("/hasChanges", bHasChanges);
        }
    });
});
